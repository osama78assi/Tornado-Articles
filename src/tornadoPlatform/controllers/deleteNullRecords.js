import generateDateBefore from "../../../util/generateDateBefore.js";
import ModeratorActionService from "../services/moderatorActionService.js";

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 */
async function deleteNullRecords(req, res, next) {
    try {
        // Check deleteNullRecords.validate.js to know what are those fields
        const { pastDuration, firstDate, secondDate } =
            req?.validatedQuery ?? {};

        // The validator middleware will force one to pass either pastDuration or date range
        if (pastDuration !== null) {
            let date = new Date();
            if (pastDuration.toLowerCase() === "now") {
                const deletedCounts =
                    await ModeratorActionService.deleteAllNullRecords();

                return res.status(200).json({
                    success: true,
                    message: `deleted ${deletedCounts} record(s) successfully`,
                    deletedCounts,
                });
            }

            // Parse the passed duration
            date = generateDateBefore(pastDuration, { firstMoment: true });
            const deletedCounts =
                await ModeratorActionService.deleteNullRecordInPast(date);

            return res.status(200).json({
                success: true,
                message: `deleted ${deletedCounts} record(s) successfully`,
                deletedCounts,
            });
        }

        const deletedCounts =
            await ModeratorActionService.deleteNullRecordsBetweeen(
                firstDate,
                secondDate
            );

        return res.status(200).json({
            success: true,
            message: `deleted ${deletedCounts} record(s) successfully`,
            deletedCounts
        });
    } catch (err) {
        next(err);
    }
}

export default deleteNullRecords;
