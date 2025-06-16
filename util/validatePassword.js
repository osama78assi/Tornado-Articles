import APIError from "./APIError.js";

function validatePassword(password) {
    if (password.length < 8) {
        throw new APIError(
            "Password must be at least 8 characters long.",
            400,
            "PASSWORD_ERROR"
        );
    }

    if (!/[A-Z]/.test(password)) {
        throw new APIError(
            "Password must contain at least one uppercase letter.",
            400,
            "PASSWORD_ERROR"
        );
    }

    if (!/[a-z]/.test(password)) {
        throw new APIError(
            "Password must contain at least one lowercase letter.",
            400,
            "PASSWORD_ERROR"
        );
    }

    if (!/[^a-zA-Z0-9&._-\{\}\(\)\s]+/.test(password)) {
        throw new APIError(
            "Password must have at least one special character (# $ % ...)",
            400,
            "PASSWORD_ERROR"
        );
    }
}

export default validatePassword;
