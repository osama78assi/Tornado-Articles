const User = require("../models/user");
const normalizeOffsetLimit = require("../util/normalizeOffsetLimit");
const { Op } = require("sequelize");
const OperationError = require("../util/operationError");
const validator = require("validator");
const { MIN_RESULTS } = require("../config/settings");

class ErrorEnum {
    static USER_NOT_FOUND = new OperationError("User not found.", 404);

    static UNVALID_ID = new OperationError("The provided ID isn't valid", 400);

    static NO_USER_WITH_ID = (id) =>
        new OperationError(`There is no user with ID ${id}`, 404);

    static NO_USER_WITH = (getBy, isEmail = true) =>
        new OperationError(
            `There is no user with ${isEmail ? "email" : "id"} "${getBy}".`,
            404
        );

    static COULD_NOT_UPDATE = new OperationError("Couldn't update", 400);

    static COULD_NOT_DELETE = new OperationError(
        "Couldn't delete. The user maybe not existed",
        400
    );
}

class UserService {
    static async getUserById(id) {
        try {
            // Check if id is UUIDv4
            if (!validator.isUUID(id, "4")) throw ErrorEnum.UNVALID_ID;

            const user = await User.findByPk(id);

            if (user === null) throw ErrorEnum.NO_USER_WITH_ID(id);

            return user;
        } catch (err) {
            throw err;
        }
    }

    static async createUser(
        fullName,
        email,
        password,
        birthDate,
        gender,
        profilePic,
        role
    ) {
        try {
            const user = await User.create({
                fullName,
                email,
                password,
                birthDate,
                gender,
                profilePic,
                role,
            });

            return user;
        } catch (err) {
            throw err;
        }
    }

    // Get user by email or id (for auth meaning it will include password)
    static async getUserForAuth(getBy, isEmail = true) {
        try {
            getBy = isEmail ? { email: getBy } : { id: getBy };
            const user = await User.findOne({
                attributes: [
                    "id",
                    "fullName",
                    "password",
                    "email",
                    "gender",
                    "profilePic",
                    "brief",
                ],
                where: {
                    ...getBy,
                },
            });

            if (!user) throw ErrorEnum.NO_USER_WITH(getBy, isEmail);

            return user;
        } catch (err) {
            throw err;
        }
    }

    static async updateUserImage(id, profilePic) {
        try {
            const affectedRows = await User.update(
                {
                    profilePic,
                },
                {
                    where: {
                        id,
                    },
                }
            );

            if (affectedRows?.[0] == 0) {
                throw ErrorEnum.COULD_NOT_UPDATE;
            }

            return affectedRows;
        } catch (err) {
            throw err;
        }
    }

    static async updateUserPassword(userId, newPassword) {
        try {
            const affectedRows = await User.update(
                { password: newPassword },
                {
                    where: {
                        id: userId,
                    },
                }
            );

            if (affectedRows[0] === 0) throw ErrorEnum.NO_USER_WITH_ID(userId);

            return affectedRows;
        } catch (err) {
            throw err;
        }
    }

    static async updateUserName(userId, newName) {
        try {
            const affectedRows = await User.update(
                { fullName: newName },
                {
                    where: {
                        id: userId,
                    },
                    returning: true,
                }
            );
            if (affectedRows[0] === 0) throw ErrorEnum.NO_USER_WITH_ID(userId);

            return affectedRows[1][0].dataValues.fullName;
        } catch (err) {
            throw err;
        }
    }

    static async deleteUser(userId) {
        try {
            const affectedRows = await User.destroy({
                where: {
                    id: userId,
                },
            });

            if (affectedRows === 0) throw ErrorEnum.COULD_NOT_DELETE;

            return affectedRows;
        } catch (err) {
            throw err;
        }
    }

    // To get profile data for example
    static async getUserDetails(userId) {
        try {
            const userData = await User.findAll({
                where: { id: userId },
                attributes: {
                    exclude: [
                        "role",
                        "allowCookies",
                        "changeDate",
                        "updatedAt",
                    ],
                },
            });

            if (userData.length === 0) throw ErrorEnum.NO_USER_WITH_ID(userId);

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
            //     throw new OperationError(
            //         "Invalid Offset or limit: these two must be positive number",
            //         400
            //     );
            /// Exclude the user if provided
            exclude = exclude !== null ? { id: { [Op.ne]: exclude } } : {};
            const results = await User.findAll({
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
            const users = await User.findAll({
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

    static async getProfilePic(userId) {
        try {
            const profilePic = await User.findOne({
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

    static async setProfilePhoto(userId, newPic) {
        try {
            const affectedRows = await User.update(
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

    static async updateBrief(userId, newBrief) {
        try {
            const affectedRows = await User.update(
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

    static async updateCookieAccess(userId, allow) {
        try {
            const affectedRows = await User.update(
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
}

module.exports = UserService;
