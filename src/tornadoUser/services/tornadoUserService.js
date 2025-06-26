import { Op } from "sequelize";
import validator from "validator";
import { MIN_RESULTS, UPDATE_NAME_LIMIT } from "../../../config/settings.js";
import APIError from "../../../util/APIError.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";
import isPassedTimeBy from "../../../util/isPassedTimeBy.js";
import User, { default as TornadoUser } from "../../auth/models/user.js";

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
    static async getUserById(id) {
        try {
            // Check if id is UUIDv4
            if (!validator.isUUID(id, "4")) throw GlobalErrorsEnum.INVALID_ID;

            const user = await TornadoUser.findByPk(id);

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
                        "passwordChangeAt",
                        "fullNameChangeAt",
                        "updatedAt",
                        "email",
                        "banTill",
                        "articlePublishedAt",
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
            const affectedRows = await TornadoUser.update(
                {
                    brief: newBrief,
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
        try {
            const user = await User.findByPk(userId, {
                attributes: ["fullNameChangeAt"],
            });

            // User can change his name once every month (due to my settings)
            if (
                user.dataValues.fullNameChangeAt !== null &&
                !isPassedTimeBy(
                    new Date(),
                    user.dataValues.fullNameChangeAt,
                    UPDATE_NAME_LIMIT
                )
            ) {
                throw ErrorsEnum.CHANGE_NAME_LIMIT;
            }

            const [affectedRows, newRowData] = await TornadoUser.update(
                { fullName: newName, fullNameChangeAt: new Date() },
                {
                    where: {
                        id: userId,
                    },
                    returning: true,
                }
            );
            if (affectedRows === 0)
                throw GlobalErrorsEnum.NO_USER_WITH(userId, false);

            return newRowData[0].dataValues.fullName;
        } catch (err) {
            throw err;
        }
    }

    static async banUserFor(userId, banTill) {
        try {
            const userData = await TornadoUser.findByPk(userId, {
                attributes: ["banTill"],
            });

            // Check if the user is already banned then don't take an action
            if (userData.dataValues.banTill > new Date())
                throw ErrorsEnum.ALREADY_BANNED;

            const [affectedRows, newRowData] = await TornadoUser.update(
                {
                    banTill,
                },
                {
                    where: {
                        id: userId,
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
                    articlePublishedAt: new Date(),
                },
                {
                    where: {
                        id: userId,
                    },
                }
            );
        } catch (err) {
            throw err;
        }
    }
}

export default TornadoUserService;
