import { Op } from "sequelize";
import validator from "validator";
import { MIN_RESULTS, UPDATE_NAME_LIMIT } from "../../../config/settings.js";
import APIError from "../../../util/APIError.js";
import isPassedTimeBy from "../../../util/isPassedTimeBy.js";
import normalizeOffsetLimit from "../../../util/normalizeOffsetLimit.js";
import User, { default as TornadoUser } from "../../auth/models/user.js";

class ErrorsEnum {
    static USER_NOT_FOUND = new APIError(
        "User not found.",
        404,
        "USER_NOT_FOUND"
    );

    static UNVALID_ID = new APIError(
        "The provided ID isn't valid",
        400,
        "INVALID_ID"
    );

    static NO_USER_WITH_ID = (id) =>
        new APIError(`There is no user with ID ${id}`, 404, "NO_USER_WITH_ID");

    static NO_USER_WITH = (getBy, isEmail = true) =>
        new APIError(
            `There is no user with ${isEmail ? "email" : "id"} "${getBy}".`,
            404,
            "USER_NOT_FOUND"
        );

    static COULD_NOT_UPDATE = new APIError(
        "Couldn't update",
        400,
        "SERVER_ERROR"
    );

    static COULD_NOT_DELETE = new APIError(
        "Couldn't delete. The user maybe not existed",
        400,
        "SERVER_ERROR"
    );

    static CHANGE_NAME_LIMIT = new APIError(
        `You can change name once every ${UPDATE_NAME_LIMIT}`,
        429,
        "TOO_AERLY_CHANGE"
    );
}

class TornadoUserService {
    static async getUserById(id) {
        try {
            // Check if id is UUIDv4
            if (!validator.isUUID(id, "4")) throw ErrorsEnum.UNVALID_ID;

            const user = await TornadoUser.findByPk(id);

            if (user === null) throw ErrorsEnum.NO_USER_WITH_ID(id);

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
                    ],
                },
            });

            if (userData.length === 0) throw ErrorsEnum.NO_USER_WITH_ID(userId);

            return userData[0];
        } catch (err) {
            throw err;
        }
    }

    static async searchByName(
        query,
        limit = MIN_RESULTS,
        offset = 0,
        exclude = null
    ) {
        // Normalize (below the zero or limit very large)
        ({ offset, limit } = normalizeOffsetLimit(offset, limit));
        try {
            // You can make the API throw error here. I preferred to use the default
            // if (limit < 0 || offset < 0)
            //     throw new APIError(
            //         "Invalid Offset or limit: these two must be positive number",
            //         400
            //     );
            /// Exclude the user if provided
            exclude = exclude !== null ? { id: { [Op.ne]: exclude } } : {};
            const results = await TornadoUser.findAll({
                attributes: ["id", "fullName", "profilePic", "gender"],
                where: {
                    fullName: {
                        [Op.iLike]: `%${query}%`,
                    },
                    ...exclude,
                },
                limit,
                offset,
            });

            return results;
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
        offset = 0,
        limit = MIN_RESULTS,
        sortBy = "createdAt",
        sortDir = "DESC",
        exclude = null
    ) {
        ({ offset, limit } = normalizeOffsetLimit(offset, limit));

        // If want to exclude a record
        const ex =
            exclude !== null ? { where: { id: { [Op.ne]: exclude } } } : {};

        try {
            const users = await TornadoUser.findAll({
                ...ex,
                offset,
                limit,
                order: [[sortBy, sortDir]],
            });

            return users;
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

            const affectedRows = await TornadoUser.update(
                { fullName: newName, fullNameChangeAt: new Date() },
                {
                    where: {
                        id: userId,
                    },
                    returning: true,
                }
            );
            if (affectedRows[0] === 0)
                throw ErrorsEnum.NO_USER_WITH(userId, false);

            return affectedRows[1][0].dataValues.fullName;
        } catch (err) {
            throw err;
        }
    }
}

export default TornadoUserService;
