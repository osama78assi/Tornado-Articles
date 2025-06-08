const { sequelize } = require("../../../config/sequelize");
const { Model, DataTypes } = require("sequelize");
const OperationError = require("../../../util/operationError");
const bcrypt = require("bcryptjs");
const validatePassword = require("../../../util/validatePassword");

// Models to add relations
const UserPreference = require("../../../models/userPreference");
const Notification = require("../../../models/notification");
const PasswordToken = require("./passwordToken");
const Category = require("../../../models/category");
const FollowedFollower = require("../../../models/followedFollower");
const Comment = require("../../../models/comment");
const CommentScore = require("../../../models/commentScore");

class User extends Model {
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
            type: DataTypes.STRING(50),
            validate: {
                is: {
                    args: /^[a-zA-Z0-9_\-\x20]+$/,
                    msg: "Name must contain only letters, numbers, hyphens (-), whitespace, or underscores (_).",
                },
                lenWithNoSpaces(fullName) {
                    if (
                        fullName.trim().length < 4 ||
                        fullName.trim().length > 50
                    ) {
                        throw new OperationError(
                            "Name length should be at least 4 characters and at maximum 50 characters.",
                            400
                        );
                    }
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
                    user.email = user.email?.trim()?.toLowerCase();
                    user.gender = user.gender?.trim()?.toLowerCase();
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
            async beforeBulkUpdate(options) {
                try {
                    // Check if the property password included in update statement
                    if (options.fields.includes("password")) {
                        validatePassword(options.attributes.password);
                        const salt = await bcrypt.genSalt(10);
                        options.attributes.password = await bcrypt.hash(
                            options.attributes.password,
                            salt
                        );
                        options.attributes.changeDate = new Date(); // Save the time when password changes. Sequelize will inlude that in the update statement
                    }

                    // The email
                    if (options.fields.includes("email")) {
                        options.attributes.email = options.attributes.email
                            ?.trim()
                            ?.toLowerCase();
                        options.attributes.changeDate = new Date(); // Save the time when email changes
                    }

                    // The full name
                    if (options.fields.includes("fullName")) {
                        options.attributes.fullName =
                            options.attributes.fullName?.trim();
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

//// Scores comments
// M:N between users and comments

User.belongsToMany(Comment, {
    through: CommentScore,
    foreignKey: "userId",
});

Comment.belongsToMany(User, {
    through: CommentScore,
    foreignKey: "commentId",
});

module.exports = User;
