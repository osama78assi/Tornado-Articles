import { ForeignKeyConstraintError, ValidationError } from "sequelize";

function prettyError(error) {
    let message = "Internal server error";
    let status = 500;
    let code = "SERVER_ERROR";

    if (error instanceof ValidationError) {
        code = "DUPLICATED_VALUE_ERROR";
        status = 400;

        // Composite primary key rule broken (same follow twice)
        if (
            error.name === "SequelizeUniqueConstraintError" &&
            error?.parent?.table === "FollowedFollowers" &&
            error?.parent?.constraint === "FollowedFollowers_pke"
        )
            message = "You've already followed that user";
        else if (
            error.name === "SequelizeUniqueConstraintError" &&
            error?.parent?.table === "UserPreferences" &&
            error?.parent?.constraint === "UserPreferences_pkey"
        )
            message = "The category is already preferred by the user";
        else if (error.name === "SequelizeUniqueConstraintError") {
            // Unique constraint (normal)
            message = `Validation error: ${error.errors?.[0].path} is already existed.`;
            status = 409;
        } else {
            message = `Validation error: ${error.errors?.[0].message}`;
            code = "VALIDATION_ERROR";
        }
    } else if (error instanceof ForeignKeyConstraintError) {
        // The foriegn key here is category id
        if (error.table === "UserPreferences") {
            message = "The provided category isn't found";
            code = "CATEGORY_NOT_FOUND";
        }
        status = 404;
    }

    // Default
    return {
        status,
        obj: {
            status: "error",
            message,
            code,
        },
    };
}

export default prettyError;
