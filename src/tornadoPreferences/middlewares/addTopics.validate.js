import { array, object, string, ZodError } from "zod/v4";
import APIError from "../../../util/APIError.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";

class ErrorsEnum {
    static TOPICS_REQUIRED = new APIError(
        "The topics are required. title and category id are required but description is optional",
        400,
        "MISSING_FIELD"
    );

    static INVALID_SHAPE = new APIError(
        "Topics must be array of objects. Each one has a title (string), categoriesIds and description (optional but type of string)",
        400,
        "VALIDATION_ERROR"
    );
}

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function addTopicsValidate(req, res, next) {
    try {
        const { topics = null } = req?.body ?? {};

        if (topics === null) return next(ErrorsEnum.TOPICS_REQUIRED);

        // Array of objects
        const Topics = array(
            object({
                categoriesIds: array(string().regex(/^\d+$/)).min(1), // At least one categoryId
                title: string(),
                description: string().optional(),
            })
        );

        Object.assign(
            req.body,
            Topics.parse(
                topics?.map?.((topic) => {
                    // Convert all categories id to string even small numbers
                    return {
                        ...topic,
                        categoriesIds: topic?.categoriesIds?.map?.(
                            (categoryId) => String(categoryId)
                        ),
                    };
                })
            )
        );

        return next();
    } catch (err) {
        if (err instanceof ZodError) {
            let code = err?.issues[0]?.code;
            let path = err?.issues[0]?.path[1]; // Remember it's 'array' of objects

            if (code === "invalid_type" && path === undefined)
                return next(ErrorsEnum.INVALID_SHAPE);

            if (
                (code === "invalid_type" ||
                    code === "invalid_format" ||
                    code === "too_small") &&
                path === "categoriesIds"
            )
                return next(
                    GlobalErrorsEnum.INVALID_BIGINT_IDS(
                        "categoriesIds property"
                    )
                );

            if (code === "invalid_type")
                return next(GlobalErrorsEnum.INVALID_DATATYPE(path, "string"));
        }

        next(err);
    }
}

export default addTopicsValidate;
