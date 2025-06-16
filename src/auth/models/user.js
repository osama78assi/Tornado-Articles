import { genSalt, hash } from "bcryptjs";
import { DataTypes, Model } from "sequelize";
import validator from "validator";
import { sequelize } from "../../../config/sequelize.js";
import APIError from "../../../util/APIError.js";
import validatePassword from "../../../util/validatePassword.js";

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
                lenWithNoSpaces(fullName) {
                    if (
                        fullName.trim().length < 4 ||
                        fullName.trim().length > 50
                    ) {
                        throw new APIError(
                            "Name length should be at least 4 characters and at maximum 50 characters.",
                            400,
                            "INVALID_NAME_LENGTH"
                        );
                    }
                },
                acceptedName(fullName) {
                    if (!/^[a-zA-Z0-9_\-\x20]+$/.test(fullName))
                        throw new APIError(
                            "Name must contain only letters, numbers, hyphens (-), whitespace, or underscores (_).",
                            400,
                            "INVALID_NAME_FORMAT"
                        );
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
        changeDate: {
            // To keep track of chaing email and password timestamp
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: new Date(),
        },
        brief: {
            type: DataTypes.STRING(150),
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
                        validatePassword(options.attributes.password);
                        const salt = await genSalt(10);
                        options.attributes.password = await hash(
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

export default User;
