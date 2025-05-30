const { sequelize } = require("../config/sequelize");
const { Model, DataTypes, literal, Op } = require("sequelize");
const OperationError = require("../helper/operationError");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const validatePassword = require("../helper/validatePassword");
const { MIN_RESULTS } = require("../config/settings");

// Models to add relations
const UserPreference = require("./userPreference");
const Notification = require("./notification");
const PasswordToken = require("./passwordToken");
const Category = require("./category");
const FollowedFollower = require("./followedFollower");
const Comment = require("./comment");
const CommentLike = require("./commentLike");
const normalizeOffsetLimit = require("../helper/normalizeOffsetLimit");

class ErrorEnum {
    static USER_NOT_FOUND = new OperationError("User not found.", 404);

    static UNVALID_ID = new OperationError("The provided ID isn't valid", 400);

    static NO_USER_WITH_ID = (id) =>
        new OperationError(`There is no user with ID ${id}`, 404);

    static NO_USER_WITH = (getBy, isEmail = true) =>
        new OperationError(
            `There is no user with ${isEmail ? "email" : "id"} "${getBy}".`,
            404
        );

    static COULD_NOT_UPDATE = new OperationError("Couldn't update", 400);

    static COULD_NOT_DELETE = new OperationError(
        "Couldn't delete. The user maybe not existed",
        400
    );
}

class User extends Model {
    static async getUserById(id) {
        try {
            // Check if id is UUIDv4
            if (!validator.isUUID(id, "4")) throw ErrorEnum.UNVALID_ID;

            const user = await this.findByPk(id);

            if (user === null) throw ErrorEnum.NO_USER_WITH_ID(id);

            return user;
        } catch (err) {
            throw err;
        }
    }

    static async createUser(
        fullName,
        email,
        password,
        birthDate,
        gender,
        profilePic,
        role
    ) {
        try {
            const user = await this.create({
                fullName,
                email,
                password,
                birthDate,
                gender,
                profilePic,
                role,
            });

            return user;
        } catch (err) {
            throw err;
        }
    }

    // Get user by email or id (for auth meaning it will include password)
    static async getUserForAuth(getBy, isEmail = true) {
        try {
            const user = await this.findOne({
                attributes: [
                    "id",
                    "fullName",
                    "password",
                    "email",
                    "gender",
                    "profilePic",
                    "brief",
                ],
                where: {
                    email: getBy,
                },
            });

            if (!user) throw ErrorEnum.NO_USER_WITH(getBy, isEmail);

            return user;
        } catch (err) {
            throw err;
        }
    }

    static async updateUserImage(id, profilePic) {
        try {
            const affectedRows = await this.update(
                {
                    profilePic,
                },
                {
                    where: {
                        id,
                    },
                }
            );

            if (affectedRows?.[0] == 0) {
                throw ErrorEnum.COULD_NOT_UPDATE;
            }

            return affectedRows;
        } catch (err) {
            throw err;
        }
    }

    static async updateUserPassword(userId, newPassword) {
        try {
            const user = await this.findByPk(userId);
            if (!user) {
                throw ErrorEnum.NO_USER_WITH_ID(userId);
            }

            user.password = newPassword;
            user.changed("password", true); // Force the changed password flag
            await user.save(); // Will trigger beforeUpdate automatically
        } catch (err) {
            throw err;
        }
    }

    static async updateUserName(userId, newName) {
        try {
            const user = await this.findByPk(userId);
            if (!user) {
                throw ErrorEnum.NO_USER_WITH_ID(userId);
            }

            user.fullName = newName;
            await user.save({
                validate: true, // Run the validators
            });
        } catch (err) {
            throw err;
        }
    }

    static async deleteUser(userId) {
        try {
            const affectedRows = await this.destroy({
                where: {
                    id: userId,
                },
            });

            if (affectedRows === 0) throw ErrorEnum.COULD_NOT_DELETE;

            return affectedRows;
        } catch (err) {
            throw err;
        }
    }

    // To get profile data for example
    static async getUserDetails(userId) {
        try {
            const userData = await this.findAll({
                where: { id: userId },
                attributes: {
                    include: [
                        [
                            // Count how many followings (users this user follows)
                            literal(`(
                                SELECT COUNT("followerId")
                                FROM "FollowedFollowers"
                                WHERE "FollowedFollowers"."followerId" = "User"."id"
                            )`),
                            "followingsCount",
                        ],
                        [
                            // Count how many followers (users who follow this user)
                            literal(`(
                                SELECT COUNT("followedId")
                                FROM "FollowedFollowers"
                                WHERE "FollowedFollowers"."followedId" = "User"."id"
                            )`),
                            "followersCount",
                        ],
                        [
                            // Number of published artilces
                            literal(`(
                                SELECT COUNT("userId") FROM "Articles"
                                WHERE "userId" = "User"."id"
                                )`),
                            "articleCounts",
                        ],
                    ],
                    exclude: [
                        "role",
                        "allowCookies",
                        "changeDate",
                        "updatedAt",
                    ],
                },
            });

            if (userData.length === 0) throw ErrorEnum.NO_USER_WITH_ID(userId);

            return userData[0];
        } catch (err) {
            throw err;
        }
    }

    static async searchByName(
        query,
        limit = MIN_RESULTS,
        offset = 0,
        exclude = null
    ) {
        // Normalize (below the zero or limit very large)
        ({ offset, limit } = normalizeOffsetLimit(offset, limit));
        try {
            // You can make the API throw error here. I preferred to use the default
            // if (limit < 0 || offset < 0)
            //     throw new OperationError(
            //         "Invalid Offset or limit: these two must be positive number",
            //         400
            //     );
            /// Exclude the user if provided
            exclude = exclude !== null ? { id: { [Op.ne]: exclude } } : {};
            const results = await this.findAll({
                attributes: ["id", "fullName", "profilePic", "gender"],
                where: {
                    fullName: {
                        [Op.iLike]: `%${query}%`,
                    },
                    ...exclude,
                },
                limit,
                offset,
            });

            return results;
        } catch (err) {
            throw err;
        }
    }

    // To get users data for admin
    static async getUsersData(
        offset = 0,
        limit = MIN_RESULTS,
        sortBy = "createdAt",
        sortDir = "ASC",
        exclude = null
    ) {
        ({ offset, limit } = normalizeOffsetLimit(offset, limit));

        // If want to exclude a record
        const ex =
            exclude !== null ? { where: { id: { [Op.ne]: exclude } } } : {};

        try {
            const users = await this.findAll({
                ...ex,
                offset,
                limit,
                order: [[sortBy, sortDir]],
            });

            return users;
        } catch (err) {
            throw err;
        }
    }

    static async getProfilePic(userId) {
        try {
            const profilePic = await this.findOne({
                attributes: ["profilePic"],
                where: {
                    id: userId,
                },
            });

            return profilePic.dataValues.profilePic;
        } catch (err) {
            throw err;
        }
    }

    static async setProfilePhoto(userId, newPic) {
        try {
            const affectedRows = await this.update(
                {
                    profilePic: newPic,
                },
                {
                    where: {
                        id: userId,
                    },
                }
            );

            return affectedRows;
        } catch (err) {
            throw err;
        }
    }

    static async updateBrief(userId, newBrief) {
        try {
            const affectedRows = await this.update(
                {
                    brief: newBrief,
                },
                {
                    where: {
                        id: userId,
                    },
                }
            );

            return affectedRows;
        } catch (err) {
            throw err;
        }
    }

    static async updateCookieAccess(userId, allow) {
        try {
            const affectedRows = await this.update(
                { allowCookies: allow },
                {
                    where: {
                        id: userId,
                    },
                }
            );

            return affectedRows;
        } catch (err) {
            throw err;
        }
    }

    // Get who is follower of user X
    static async getFollowers(userId, offset = 0, limit = MIN_RESULTS) {
        // It's a good idea to add these two functions (getFollowers and getFollowings)
        // in FollowedFollwers model but that will cause a problem because users import FollowedFollower
        
        ({ offset, limit } = normalizeOffsetLimit(offset, limit));
        try {
            // I want to include the followers but if I used User and include I no longer can user offset and limit
            // So in this way I join 1:M between junction table (FollowedFollowers) with User table
            // Where my wanted data lives and I can apply limit and offset easily
            const followers = await FollowedFollower.findAll({
                attributes: [],
                where: {
                    followedId: userId,
                },
                include: {
                    model: this,
                    as: "follower",
                    attributes: ["id", "fullName", "profilePic", "gender"],
                },
                offset,
                limit,
            });

            // Update the array. Send only the data for followers
            return followers.map((follower) => {
                return follower.dataValues.follower;
            });
        } catch (err) {
            throw err;
        }
    }

    // Get who is followed by user X
    static async getFollowings(userId, offset = 0, limit = MIN_RESULTS) {
        ({ offset, limit } = normalizeOffsetLimit(offset, limit));
        try {
            // Same as above
            const followings = await FollowedFollower.findAll({
                attributes: [],
                where: {
                    followerId: userId,
                },
                include: {
                    model: this,
                    as: "following",
                    attributes: ["id", "fullName", "profilePic", "gender"],
                },
                offset,
                limit,
            });

            // Update the array. Send only the data for followings
            return followings.map((following) => {
                return following.dataValues.following;
            });
        } catch (err) {
            throw err;
        }
    }

    // To override the toJSON method and exclude the password attribute
    toJSON() {
        const values = { ...this.get() };
        delete values.password;
        delete values.changeDate; // No one must know or care when the user changed his password or email
        return values;
    }
}

User.init(
    {
        id: {
            type: DataTypes.UUID,
            primaryKey: true,
            defaultValue: DataTypes.UUIDV4,
        },
        fullName: {
            type: DataTypes.STRING,
            validate: {
                is: {
                    args: /^[a-zA-Z0-9_-\s]+$/,
                    msg: "Name must contain only letters, numbers, hyphens (-), whitespaces, or underscores (_).",
                },
                len: {
                    args: 4,
                    msg: "Name length should be at least 4 characters",
                },
            },
            allowNull: false,
            // unique: true // Commented because I use sync with alter set to true and this duplicate the constraint in my DB
        },
        email: {
            type: DataTypes.STRING(254),
            validate: {
                isEmail: {
                    msg: "The email is invalid",
                },
            },
            allowNull: false,
            // unique: true,
        },
        password: {
            type: DataTypes.CHAR(60),
            allowNull: false,
        }, // Length for bcrypt result is 60 but for safety
        birthDate: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            validate: {
                isOldEnough(value) {
                    const date = new Date(value);

                    // Extra condition
                    if (String(date) === "Invalid Date")
                        throw new Error("Invalid birth date.");

                    if (new Date().getFullYear() - date.getFullYear() < 12)
                        throw new Error("You're too young. :)");
                },
            },
        },
        gender: {
            type: DataTypes.ENUM("male", "female"),
            allowNull: false,
        },
        role: {
            type: DataTypes.ENUM("admin", "user"),
            allowNull: false,
        },
        changeDate: {
            // To keep track of chaing email and password timestamp
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: new Date(),
        },
        profilePic: {
            type: DataTypes.STRING(150),
        },
        brief: {
            type: DataTypes.STRING(150),
        },
        allowCookies: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
    },
    {
        sequelize,
        defaultScope: {
            attributes: {
                exclude: ["password"], // Exclude it from the object also
            },
        },
        hooks: {
            async beforeCreate(user) {
                try {
                    // Trim the spaces
                    user.fullName = user.fullName?.trim();
                    user.email = user.email?.trim();
                    user.gender = user.gender?.trim();
                    user.password = user.password?.trim();

                    // Custom password validation (run here before hashing)
                    validatePassword(user.password);
                    const salt = await bcrypt.genSalt(10);
                    user.password = await bcrypt.hash(user.password, salt);

                    user.email = user.email.toLowerCase();
                } catch (err) {
                    throw err;
                }
            },
            async beforeUpdate(user) {
                try {
                    // Check if the property password changed
                    if (user.changed("password")) {
                        validatePassword(user.password);
                        const salt = await bcrypt.genSalt(10);
                        user.password = await bcrypt.hash(user.password, salt);
                        user.changeDate = new Date(); // Save the time when password changes
                    }

                    // The email
                    if (user.changed("email")) {
                        user.changeDate = new Date(); // Save the time when email changes
                    }
                } catch (err) {
                    throw err;
                }
            },
        },
        timestamp: true,
    }
);

// Many to Many relationship between users (like user A get an array with who is following)
User.belongsToMany(User, {
    through: FollowedFollower,
    foreignKey: "followerId",
    as: "followings",
});

// To be able to get user data form junction table also
// (don't confuse here the followers is the real meaning)
FollowedFollower.belongsTo(User, {
    foreignKey: "followerId",
    as: "follower",
});

//////// Users Followings
// Who followed (like user A get an array with who follows A)
User.belongsToMany(User, {
    through: FollowedFollower,
    foreignKey: "followedId",
    as: "followers",
});

// To be able to get user data form junction table also
// (don't confuse here the followings is the real meaning)
FollowedFollower.belongsTo(User, {
    foreignKey: "followedId",
    as: "following",
});

////// Notification
// Users have a one to many relationship with notifications
User.hasMany(Notification, {
    foreignKey: "userId",
    onDelete: "CASCADE",
});

////// PasswordTokens
// The relation between user and token is one to many (user can have many reset password token but not all of them is valid)
User.hasMany(PasswordToken, {
    foreignKey: "userId",
});

////////// Categoires
// User and categories got many-to-many relationship (prefered categories)
User.belongsToMany(Category, {
    through: { model: UserPreference, unique: false },
    foreignKey: "userId",
    onDelete: "CASCADE",
});

Category.belongsToMany(User, {
    through: { model: UserPreference, unique: false },
    foreignKey: "categoryId",
    onDelete: "CASCADE",
});

//// Likes comments
// M:N between users and comments

User.belongsToMany(Comment, {
    through: CommentLike,
    foreignKey: "userId",
});

Comment.belongsToMany(User, {
    through: CommentLike,
    foreignKey: "commentId",
});

module.exports = User;
