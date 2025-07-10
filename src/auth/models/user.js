import { genSalt, hash } from "bcryptjs";
import { DataTypes, Model } from "sequelize";
import validator from "validator";
import { sequelize } from "../../../config/sequelize.js";
import APIError from "../../../util/APIError.js";
import validateFullName from "../../../util/validateFullName.js";
import validatePassword from "../../../util/validatePassword.js";
import { generateSnowFlakeIdUser } from "../../../config/snowFlake.js";

class User extends Model {
    // To override the toJSON method and exclude the password attribute
    toJSON() {
        const values = { ...this.get() };
        delete values.password;
        // delete values.passwordChangeAt; // No one must know or care when the user changed his password or email
        // delete values.fullNameChangeAt; // Same here
        // delete values.articlePublishedAt;
        return values;
    }
}

User.init(
    {
        id: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            defaultValue: () => generateSnowFlakeIdUser(),
        },
        fullName: {
            type: DataTypes.STRING(150),
            validate: {
                validate(name) {
                    validateFullName(name.trim());
                },
            },
            allowNull: false,
            // unique: true // Commented because I use sync with alter set to true and this duplicate the constraint in my DB
        },
        email: {
            type: DataTypes.STRING(254),
            validate: {
                isValidEmail(email) {
                    if (!validator.isEmail(email)) {
                        throw new APIError(
                            "The email is invalid",
                            400,
                            "INVALID_EMAIL"
                        );
                    }
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
                isValidDate(value) {
                    const date = new Date(value);
                    // Extra condition
                    if (String(date) === "Invalid Date")
                        throw new APIError(
                            "Invalid birth date.",
                            400,
                            "INVALID_BIRTH_DATE"
                        );
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
        profilePic: {
            type: DataTypes.STRING(150),
        },
        // passwordChangeAt: {
        //     // To keep track of changing timestamp
        //     type: DataTypes.DATE,
        //     allowNull: true,
        // },
        // fullNameChangeAt: {
        //     type: DataTypes.DATE,
        //     allowNull: true,
        // },
        // articlePublishedAt: {
        //     type: DataTypes.DATE,
        //     allowNull: true,
        // },
        // banTill: {
        //     // Like a warnning to the user ban about 7 months from publishing articles
        //     type: DataTypes.DATE,
        //     allowNull: true,
        // },
        // canGenForgetPassAt: {
        //     // To block user a period of time when he/she ask many times for forget password token
        //     type: DataTypes.DATE,
        //     allowNull: true,
        // },
        brief: {
            type: DataTypes.STRING(150),
            validate: {
                validateLength(brief) {
                    if (brief?.length < 3 || brief?.length > 150) {
                        throw new APIError(
                            "Brief must be at least 3 characters and 150 maximum",
                            400,
                            "VALIDATION_ERROR"
                        );
                    }
                },
            },
        },
        allowCookies: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
        followerCounts: {
            // Reduce queries count
            type: DataTypes.BIGINT,
            defaultValue: 0,
            validate: {
                min: 0,
            },
            allowNull: false,
        },
        followingCounts: {
            type: DataTypes.BIGINT,
            defaultValue: 0,
            validate: {
                min: 0,
            },
            allowNull: false,
        },
        articleCounts: {
            type: DataTypes.BIGINT,
            defaultValue: 0,
            validate: {
                min: 0,
            },
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
        indexes: [
            {
                // This will be great for searching for users by names. browse users, get followers & followings etc...
                name: "full_name_created_at_users_btree_index",
                fields: [
                    { name: "fullName" },
                    { name: "createdAt", order: "DESC" },
                ],
                type: "BTREE",
            },
        ],
        hooks: {
            async beforeCreate(user) {
                try {
                    // Trim the spaces
                    user.fullName = user.fullName?.trim();
                    user.email = user.email?.trim();
                    user.gender = user.gender?.trim()?.toLowerCase();
                    user.password = user.password?.trim();
                    user.brief = user.brief?.trim();

                    // Custom password validation (run here before hashing)
                    validatePassword(user.password);
                    const salt = await genSalt(10);
                    user.password = await hash(user.password, salt);

                    user.email = user.email.toLowerCase();
                } catch (err) {
                    throw err;
                }
            },
            async beforeBulkUpdate(options) {
                try {
                    // Check if the property password included in update statement
                    if (options.fields.includes("password")) {
                        options.attributes.password =
                            options.attributes.password?.trim();

                        validatePassword(options.attributes.password);
                        const salt = await genSalt(10);
                        options.attributes.password = await hash(
                            options.attributes.password,
                            salt
                        );
                        options.attributes.changeDate = new Date(); // Save the time when password changes. Sequelize will inlude that in the update statement
                    }

                    // The full name
                    if (options.fields.includes("fullName")) {
                        options.attributes.fullName =
                            options.attributes.fullName?.trim();

                        validateFullName(options.attributes.fullName);
                    }

                    // Brief
                    if (options.fields.includes("brief")) {
                        options.attributes.brief =
                            options.attributes.brief?.trim();
                    }
                } catch (err) {
                    throw err;
                }
            },
        },
        timestamp: true,
    }
);

export default User;
