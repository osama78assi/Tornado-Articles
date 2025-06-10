import { genSalt, hash } from "bcryptjs";
import { DataTypes, Model } from "sequelize";
import { isEmail } from "validator";
import { sequelize } from "../../../config/sequelize";
import OperationError from "../../../util/operationError";
import validatePassword from "../../../util/validatePassword";

class AuthUser extends Model {
    // To override the toJSON method and exclude the password attribute
    toJSON() {
        const values = { ...this.get() };
        delete values.password;
        delete values.changeDate; // No one must know or care when the user changed his password or email
        return values;
    }
}

AuthUser.init(
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
                        throw new OperationError(
                            "Name length should be at least 4 characters and at maximum 50 characters.",
                            400,
                            "INVALID_NAME_LENGTH"
                        );
                    }
                },
                acceptedName(fullName) {
                    if (!/^[a-zA-Z0-9_\-\x20]+$/.test(fullName))
                        throw new OperationError(
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
                    if (!isEmail(email)) {
                        throw new OperationError(
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
                        throw new OperationError(
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

export default AuthUser;
