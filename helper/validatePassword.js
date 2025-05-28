const OperationError = require("./operationError");

function validatePassword(password) {
    console.log("\n\n###########", password, "\n\n###########");
    if (password.length < 8) {
        throw new OperationError(
            "Password must be at least 8 characters long.",
            400
        );
    }

    if (!/[A-Z]/.test(password)) {
        throw new OperationError(
            "Password must contain at least one uppercase letter.",
            400
        );
    }

    if (!/[a-z]/.test(password)) {
        throw new OperationError(
            "Password must contain at least one lowercase letter.",
            400
        );
    }

    if (!/[^a-zA-Z0-9&._-\{\}\(\)\s]+/.test(password)) {
        throw new OperationError(
            "Password must have at least one special character (# $ % ...)",
            400
        );
    }
}

module.exports = validatePassword;
