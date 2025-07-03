import APIError from "./APIError.js";

/**
 *
 * @param {string} fullName
 */
export default function validateFullName(fullName) {
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
