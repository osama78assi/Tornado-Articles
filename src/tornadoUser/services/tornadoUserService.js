import { Op } from "sequelize";
import { sequelize } from "../../../config/sequelize.js";
import { MIN_RESULTS, UPDATE_NAME_LIMIT } from "../../../config/settings.js";
import APIError from "../../../util/APIError.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";
import isPassedTimeBy from "../../../util/isPassedTimeBy.js";
import User, { default as TornadoUser } from "../../auth/models/user.js";
import UserLimit from "../../auth/models/userLimit.js";

class ErrorsEnum {
    static CHANGE_NAME_LIMIT = new APIError(
        `You can change name once every ${UPDATE_NAME_LIMIT}`,
        429,
        "TOO_AERLY_CHANGE"
    );

    static ALREADY_BANNED = new APIError(
        "The user has already banned (the duration hasn't passed yet)",
        400,
        "ALREADY_BANNED"
    );
}

class TornadoUserService {
    // Copied from AuthUserService but sometimes this module loaded in the memory so no need to load other module
    static async getUserProps(userId, userFields = [], limitsFields = []) {
        try {
            let include = {
                include: {
                    model: UserLimit,
                    as: "limits",
                    attributes: limitsFields,
                },
            };

            const user = await User.findByPk(userId, {
                attributes: userFields,
                ...(limitsFields.length ? include : {}),
            });

            if (user === null)
                throw GlobalErrorsEnum.NO_USER_WITH(userId, false);

            return user;
        } catch (err) {
            throw err;
        }
    }

    static async getUserById(id) {
        try {
            // Check if id is BIGINT
            if (!/^\d+$/.test(id))
                throw GlobalErrorsEnum.INVALID_BIGINT_ID("userId");

            const user = await TornadoUser.findByPk(id, {
                include: {
                    model: UserLimit,
                    as: "limits",
                    attributes: {
                        exclude: ["userId"],
                    },
                },
            });

            if (user === null) throw GlobalErrorsEnum.NO_USER_WITH(id, false);

            return user;
        } catch (err) {
            throw err;
        }
    }

    // To get profile data for example
    static async getUserDetails(userId) {
        try {
            const userData = await TornadoUser.findAll({
                where: { id: userId },
                attributes: {
                    exclude: [
                        "role",
                        "allowCookies",
                        "updatedAt",
                        "email",
                    ],
                },
            });

            if (userData.length === 0)
                throw GlobalErrorsEnum.NO_USER_WITH(userId, false);

            return userData[0];
        } catch (err) {
            throw err;
        }
    }

    static async searchByName(
        query,
        limit = MIN_RESULTS,
        entryItemDate,
        getAfter,
        excludeId = null
    ) {
        try {
            // Chose the direction
            const dir = getAfter
                ? { [Op.lt]: entryItemDate }
                : { [Op.gt]: entryItemDate };

            const results = await TornadoUser.findAll({
                attributes: [
                    "id",
                    "fullName",
                    "profilePic",
                    "gender",
                    "createdAt",
                ],
                where: {
                    fullName: {
                        [Op.iLike]: `${query}%`, // More friendly with BTREE index
                    },
                    createdAt: dir,
                },
                order: [["createdAt", "DESC"]],
                limit,
                // FOR TESTING
                // benchmark: true,
                // logging: (sql, timeMs) => {
                //     loggingService.emit("query-time-usage", { sql, timeMs });
                // },
            });

            // Exclude in js not in db
            return results.filter((user) => user.dataValues.id !== excludeId);
        } catch (err) {
            throw err;
        }
    }

    static async getProfilePic(userId) {
        try {
            const profilePic = await TornadoUser.findOne({
                attributes: ["profilePic"],
                where: {
                    id: userId,
                },
            });

            return profilePic.dataValues.profilePic;
        } catch (err) {
            throw err;
        }
    }

    static async updateCookieAccess(userId, allow) {
        try {
            const affectedRows = await TornadoUser.update(
                { allowCookies: allow },
                {
                    where: {
                        id: userId,
                    },
                }
            );

            return affectedRows;
        } catch (err) {
            throw err;
        }
    }

    static async updateBrief(userId, newBrief) {
        try {
            const [, data] = await TornadoUser.update(
                {
                    brief: newBrief,
                },
                {
                    where: {
                        id: userId,
                    },
                    validate: true,
                    returning: true,
                }
            );

            return data[0].dataValues.brief;
        } catch (err) {
            throw err;
        }
    }

    // To get users data for admin
    static async getUsersData(
        limit = MIN_RESULTS,
        entryItemName,
        getAfter,
        exclude = null
    ) {
        // Specify backward or forward (according to the nature of alphabetic b is larger than a)
        const dir = getAfter
            ? { [Op.gt]: entryItemName }
            : { [Op.lt]: entryItemName };

        try {
            const users = await TornadoUser.findAll({
                where: {
                    fullName: dir,
                },
                include: {
                    model: UserLimit,
                    as: "limits",
                    attributes: {
                        exclude: ["userId"],
                    },
                },
                limit,
                order: [["fullName", "ASC"]],
                // benchmark: true,
                // logging(sql, timeMs) {
                //     loggingService.emit("query-time-usage", { sql, timeMs });
                // },
            });

            // Exclude the given id
            return users.filter((user) => user.dataValues.id !== exclude);
        } catch (err) {
            throw err;
        }
    }

    static async setProfilePhoto(userId, newPic) {
        try {
            const affectedRows = await TornadoUser.update(
                {
                    profilePic: newPic,
                },
                {
                    where: {
                        id: userId,
                    },
                }
            );

            return affectedRows;
        } catch (err) {
            throw err;
        }
    }

    static async updateUserName(userId, newName) {
        const t = sequelize.transaction();
        try {
            const user = await User.findByPk(userId, {
                attributes: [],
                include: {
                    model: UserLimit,
                    as: "limits",
                    attributes: ["fullNameChangedAt"],
                },
            });

            // User can change his name once every month (due to my settings)
            if (
                user.limits.fullNameChangedAt !== null &&
                !isPassedTimeBy(
                    new Date(),
                    user.limits.fullNameChangedAt,
                    UPDATE_NAME_LIMIT
                )
            ) {
                throw ErrorsEnum.CHANGE_NAME_LIMIT;
            }

            const [affectedRows, newRowData] = await TornadoUser.update(
                { fullName: newName },
                {
                    where: {
                        id: userId,
                    },
                    validate: true,
                    returning: true,
                    transaction: t,
                }
            );

            if (affectedRows === 0)
                throw GlobalErrorsEnum.NO_USER_WITH(userId, false);

            // Update the limits
            await UserLimit.update(
                { fullNameChangedAt: new Date() },
                {
                    where: {
                        userId,
                    },
                    transaction: t,
                }
            );

            (await t).commit();
            return newRowData[0].dataValues.fullName;
        } catch (err) {
            (await t).rollback();

            throw err;
        }
    }

    static async banUserFor(userId, banTill) {
        try {
            const userData = await UserLimit.findByPk(userId, {
                attributes: ["banTill"],
            });

            // Check if the user is already banned then don't take an action
            if (userData.dataValues.banTill > new Date())
                throw ErrorsEnum.ALREADY_BANNED;

            const [, newRowData] = await UserLimit.update(
                {
                    banTill,
                },
                {
                    where: {
                        userId,
                    },
                    returning: true,
                }
            );

            return newRowData[0].dataValues.banTill;
        } catch (err) {
            throw err;
        }
    }

    static async addNewArticle(userId, articleCounts, t) {
        try {
            // This transaction must be managed by the function which passed it
            // await User.increment("articleCounts", {
            //     where: { id: userId },
            //     transaction: t,
            // });

            // Update also the publish time maybe in one query
            await User.update(
                {
                    articleCounts: articleCounts + 1,
                },
                {
                    where: {
                        id: userId,
                    },
                    transaction: t,
                }
            );

            await UserLimit.update(
                {
                    articlePublishedAt: new Date(),
                },
                {
                    where: {
                        userId,
                    },
                }
            );
        } catch (err) {
            throw err;
        }
    }
}

export default TornadoUserService;
