import profilePicStorage from "../config/profilePicStorage.js";
import APIError from "../util/APIError.js";
import {
    SingleFileError,
    singleTornadoFile,
} from "../util/fileUploaderHandlers.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function downloadProfilePicV1(req, res, next) {
    try {
        singleTornadoFile({
            storage: profilePicStorage,
            fieldName: "profilePic",
        })(req, res, function (err) {
            // Handle the error boubled up from the middleware in here
            if (err) {
                if (err instanceof SingleFileError) {
                    return next(
                        new APIError(
                            "Expected one profile picture but recieved more than one",
                            400,
                            "VALIDATION_ERROR"
                        )
                    );
                }

                // If the error is known
                if (err instanceof APIError) return next(err);

                // Log the error if you want
                return next(
                    new APIError(
                        "Couldn't upload the photo to the server. Please try again",
                        500,
                        "SERVER_ERROR"
                    )
                );
            }

            // Call the next
            next();
        });
    } catch (err) {
        next(err);
    }
}

export default downloadProfilePicV1;
