import { string, ZodError } from "zod/v4";
import APIError from "../../../util/APIError.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";

class ErrorsEnum {
    static INVALID_DEVICE_NAME_LENGTH = new APIError(
        "The device name should be at least 1 character and 255 characters maximum",
        400,
        "VALIDATION_ERROR"
    );
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function logoutDeviceValidate(req, res, next) {
    try {
        // The device name must be included
        const { deviceName = null } = req?.query ?? {};

        if (deviceName === null)
            return next(GlobalErrorsEnum.MISSING_FIELD("device name"));

        // By the way we don't use real devices names but assusming we use it
        const DeviceName = string().trim().min(1).max(255); // Assuming there is a device with that name

        req.validatedQuery = { deviceName: DeviceName.parse(deviceName) };
        next();
    } catch (err) {
        if (err instanceof ZodError) {
            let code = err.issues[0].code;

            if (code === "invalid_type") {
                return next(
                    GlobalErrorsEnum.INVALID_DATATYPE(
                        "deviceName",
                        err.issues[0].expected
                    )
                );
            }

            if (code === "too_small" || code === "too_big")
                return next(ErrorsEnum.INVALID_DEVICE_NAME_LENGTH);
        }

        next();
    }
}

export default logoutDeviceValidate;
