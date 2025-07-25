function generateCode(length) {
    let code = [];
    for (let i = 0; i < length; i++) {
        code.push(Math.floor(Math.random() * 10));
    }

    return code;
}

function deleteOneLvl(queryObject, fields = []) {
    delete queryObject.dataValues[fields.at(0)].dataValues[fields.at(1)];
}

function sanitize(queryObject, fields = []) {
    for (let i = 0; i < fields.length; i++) {
        // Check if it's array then that's mean it's nested by one level
        if (Array.isArray(fields[i])) {
            deleteOneLvl(queryObject, fields[i]);
        } else {
            delete queryObject.dataValues[fields[i]];
        }
    }
}

/**
 *
 * @param {string} fullName
 */
function validateFullName(fullName) {
    if (fullName.length < 4 || fullName.length > 150) {
        throw new APIError(
            "Full name length should be at least 4 characters and at maximum 150 characters.",
            400,
            "INVALID_NAME_LENGTH"
        );
    }

    if (!/^[a-zA-Z0-9_\-\x20]+$/.test(fullName))
        throw new APIError(
            "Name must contain only letters, numbers, hyphens (-), whitespace, or underscores (_).",
            400,
            "INVALID_NAME_FORMAT"
        );
}

function validatePassword(password) {
    if (password.length < 8) {
        throw new APIError(
            "Password must be at least 8 characters long.",
            400,
            "VALIDATION_ERROR"
        );
    }

    // That length is logical right ?
    if (password.length > 150) {
        throw new APIError(
            "Password is too long. the length should be larger than 8 and less than 150",
            400,
            "VALIDATION_ERROR"
        );
    }

    if (!/[A-Z]/.test(password)) {
        throw new APIError(
            "Password must contain at least one uppercase letter.",
            400,
            "VALIDATION_ERROR"
        );
    }

    if (!/[a-z]/.test(password)) {
        throw new APIError(
            "Password must contain at least one lowercase letter.",
            400,
            "VALIDATION_ERROR"
        );
    }

    if (!/[^a-zA-Z0-9&._-\{\}\(\)\s]+/.test(password)) {
        throw new APIError(
            "Password must have at least one special character (# $ % ...)",
            400,
            "VALIDATION_ERROR"
        );
    }
}

export { generateCode, sanitize, validateFullName, validatePassword };
