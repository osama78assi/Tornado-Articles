import { Op } from "sequelize";
import { sequelize } from "../../../config/sequelize.js";
import APIError from "../../../util/APIError.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";
import ModeratorAction from "../models/moderatorAction.js";

class ErrorsEnum {
    static ACTION_NOT_FOUND = new APIError(
        "The action is not found or already deleted",
        404,
        "ACTION_NOT_FOUND"
    );
}

class ModeratorActionService {
    static async addBanRecord(
        userId,
        userName,
        userEmail,
        duration,
        reason,
        transaction = null
    ) {
        // When the user doesn't pass the transaction create it by my self
        let passedTransaction = transaction !== null;

        if (!passedTransaction) {
            transaction = await sequelize.transaction();
        }

        try {
            await ModeratorAction.create(
                {
                    userId,
                    userName,
                    userEmail,
                    actionType: "ban",
                    reason,
                    duration,
                },
                {
                    transaction,
                    validate: true,
                }
            );

            // If the transaction is passed by the developer let him manage it
            if (!passedTransaction) await transaction.commit();
            return true;
        } catch (err) {
            if (!passedTransaction) await transaction.rollback();
            throw err;
        }
    }

    static async addDeleteUserRecord(
        userName,
        userEmail,
        reason,
        transaction = null
    ) {
        // When the user doesn't pass the transaction create it by my self
        let passedTransaction = transaction !== null;

        if (!passedTransaction) {
            transaction = await sequelize.transaction();
        }

        try {
            await ModeratorAction.create(
                {
                    userId: null, // Because the user will be deleted
                    userName,
                    userEmail,
                    actionType: "delete account",
                    reason,
                    duration: "permanent",
                },
                {
                    transaction,
                    validate: true,
                }
            );

            // If the transaction is passed by the developer let him manage it
            if (!passedTransaction) await transaction.commit();

            return true;
        } catch (err) {
            if (!passedTransaction) await transaction.rollback();
            throw err;
        }
    }

    static async addDeleteArticleRecord(
        userId,
        userEmail,
        userName,
        reason,
        transaction
    ) {
        // When the user doesn't pass the transaction create it by my self
        let passedTransaction = transaction !== null;

        if (!passedTransaction) {
            transaction = await sequelize.transaction();
        }

        try {
            await ModeratorAction.create(
                {
                    userId,
                    userName,
                    userEmail,
                    actionType: "delete article",
                    duration: "permanent",
                    reason,
                },
                { transaction, validate: true }
            );

            // If the transaction is passed by the developer let him manage it
            if (!passedTransaction) await transaction.commit();

            return true;
        } catch (err) {
            if (!passedTransaction) await transaction.rollback();
            throw err;
        }
    }

    static async getActions(lastEntryId, limit, userId = null) {
        try {
            const actions = await ModeratorAction.findAll({
                where: {
                    ...(userId !== null ? { userId } : {}),
                    id: {
                        [Op.lt]: lastEntryId,
                    },
                },
                limit,
                order: [["id", "DESC"]],
            });

            return actions;
        } catch (err) {
            throw err;
        }
    }

    static async deleteAction(actionId) {
        try {
            if (!/^\d+$/.test(actionId))
                throw GlobalErrorsEnum.INVALID_BIGINT_ID("action id");

            const rowDeleted = await ModeratorAction.destroy({
                where: { id: actionId },
            });

            if (rowDeleted === 0) throw ErrorsEnum.ACTION_NOT_FOUND;

            return rowDeleted;
        } catch (err) {
            throw err;
        }
    }

    static async publishAction(
        userId,
        userName,
        userEmail,
        actionType,
        duration,
        reason
    ) {
        try {
            const action = await ModeratorAction.create(
                {
                    userId,
                    userName,
                    userEmail,
                    actionType,
                    duration,
                    reason,
                },
                {
                    returning: true,
                }
            );

            return action;
        } catch (err) {
            throw err;
        }
    }

    static async updateAction(id, actionType, duration, reason) {
        try {
            const [, action] = await ModeratorAction.update(
                {
                    duration,
                    actionType,
                    reason,
                },
                {
                    where: {
                        id,
                    },
                    returning: true,
                    validate: true,
                }
            );

            if (action === null) throw ErrorsEnum.ACTION_NOT_FOUND;

            return action[0];
        } catch (err) {
            throw err;
        }
    }

    static async deleteAllNullRecords() {
        try {
            const deletedCounts = await ModeratorAction.destroy({
                where: { userId: null },
            });

            return deletedCounts;
        } catch (err) {
            throw err;
        }
    }

    static async deleteNullRecordInPast(durationDate) {
        try {
            const deletedCounts = await ModeratorAction.destroy({
                where: {
                    userId: null,
                    createdAt: {
                        [Op.gte]: durationDate, // from that let's say month till now
                    },
                },
            });

            return deletedCounts;
        } catch (err) {
            throw err;
        }
    }

    static async deleteNullRecordsBetweeen(firstDate, secondDate) {
        try {
            const deletedCounts = await ModeratorAction.destroy({
                where: {
                    userId: null,
                    createdAt: {
                        [Op.between]: [firstDate, secondDate], // from that let's say month till now
                    },
                },
            });

            return deletedCounts;
        } catch (err) {
            throw err;
        }
    }
}

export default ModeratorActionService;
