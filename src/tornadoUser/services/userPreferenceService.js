import { Op } from "sequelize";
import { sequelize } from "../../../config/sequelize.js";
import { MIN_RESULTS } from "../../../config/settings.js";
import normalizeOffsetLimit from "../../../util/normalizeOffsetLimit.js";
import Category from "../../tornadoCategories/models/category.js";
import UserPreference from "../models/userPreference.js";

class UserPreferenceService {
    static async addPreferredCategories(userId, categoriesIds) {
        try {
            // The records we want to add
            const zip = categoriesIds.map((categoryId) => {
                return {
                    userId,
                    categoryId,
                };
            });

            const data = await UserPreference.bulkCreate(zip);

            return data;
        } catch (err) {
            throw err;
        }
    }

    static async updatePreferredCategories(userId, toAdd = [], toDelete = []) {
        // Start unmanaged transaction
        const t = await sequelize.transaction();

        // Zip the toAdd
        const toAddZip = toAdd.map((categoryId) => {
            return {
                userId,
                categoryId,
            };
        });

        try {
            // If there is something to add
            // Add the new items. Pass the transaction
            toAddZip.length !== 0 &&
                (await UserPreference.bulkCreate(toAddZip, {
                    transaction: t,
                }));

            // If no errors happened let's do the same for delete
            toDelete.length !== 0 &&
                (await UserPreference.destroy({
                    where: {
                        categoryId: {
                            [Op.in]: toDelete, // If faced any ID from this array delete it
                        },
                    },
                    transaction: t,
                }));

            // No error happened ? commit
            await t.commit();
        } catch (err) {
            console.log(err);
            // any error ? rolback and throw that error
            await t.rollback();
            throw err;
        }
    }

    static async getPreferredCategories(
        userId,
        offset = 0,
        limit = MIN_RESULTS
    ) {
        ({ offset, limit } = normalizeOffsetLimit(offset, limit));
        try {
            const preferredCategories = await UserPreference.findAll({
                attributes: [],
                where: {
                    userId,
                },
                include: {
                    model: Category,
                    attributes: {
                        exclude: ["createdAt"],
                    },
                },
                offset,
                limit,
            });

            return preferredCategories.map((prefCategory) => {
                return prefCategory.dataValues.Category;
            });
        } catch (err) {
            throw err;
        }
    }
}

export default UserPreferenceService;
