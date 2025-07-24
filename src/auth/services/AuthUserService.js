import { sequelize } from "../../../config/sequelize.js";
import APIError from "../../../util/APIError.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";
import ModeratorActionService from "../../tornadoPlatform/services/moderatorActionService.js";
import User from "../models/user.js";
import UserLimit from "../models/userLimit.js";

class ErrorsEnum {
    static COULD_NOT_DELETE = new APIError(
        "Couldn't delete the user or the user has been already deleted.",
        400,
        "SERVER_ERROR"
    );
}

class AuthUserService {
    // This is the same as calling findAll but abstracted
    static async getUserProps(
        getBy,
        userFields = [],
        limitsFields = [],
        isEmail = false
    ) {
        try {
            if (!isEmail && !/^\d+$/.test(getBy))
                throw GlobalErrorsEnum.INVALID_BIGINT_ID("userId");

            let getByObj = isEmail ? { email: getBy } : { id: getBy };

            let include = {
                include: {
                    model: UserLimit,
                    as: "limits",
                    attributes: limitsFields,
                },
            };

            const user = await User.findOne({
                where: {
                    ...getByObj,
                },
                attributes: userFields,
                ...(limitsFields.length ? include : {}),
            });

            if (user === null)
                throw GlobalErrorsEnum.NO_USER_WITH(getBy, isEmail);

            return user;
        } catch (err) {
            throw err;
        }
    }

    static async verifyEmail(userId) {
        try {
            const [affectedRows] = await UserLimit.update(
                { verifiedEmail: true, canVerifyEmailAt: null },
                {
                    where: {
                        userId,
                    },
                }
            );

            return affectedRows;
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
        const t = await sequelize.transaction();
        try {
            const user = await User.create(
                {
                    fullName,
                    email,
                    password,
                    birthDate,
                    gender,
                    profilePic,
                    role,
                },
                { transaction: t }
            );

            // Create the limits
            const limits = await UserLimit.create(
                { userId: user.dataValues.id },
                {
                    transaction: t,
                }
            );

            await t.commit();

            // Delete the duplicated id
            delete limits.dataValues.userId;

            // Attach it to match the same shape when you query for a user
            user.dataValues.limits = limits.dataValues;

            return user;
        } catch (err) {
            await t.rollback();
            throw err;
        }
    }

    // Get user by email or id (for auth meaning it will include password)
    static async getUserBy(getBy, isEmail = true) {
        try {
            if (!isEmail && !/^\d+$/.tests(getBy))
                throw GlobalErrorsEnum.INVALID_BIGINT_ID("userId");

            let getByObj = isEmail ? { email: getBy } : { id: getBy };
            const user = await User.findOne({
                attributes: [
                    "id",
                    "fullName",
                    "password",
                    "email",
                    "role",
                    "gender",
                    "profilePic",
                    "brief",
                    "birthDate",
                    "followerCounts",
                    "followingCounts",
                    "articleCounts",
                    "allowCookies",
                ],
                where: {
                    ...getByObj,
                },
                include: {
                    model: UserLimit,
                    as: "limits",
                    attributes: {
                        exclude: ["userId"],
                    },
                },
            });

            if (!user) throw GlobalErrorsEnum.NO_USER_WITH(getBy, isEmail);

            return user;
        } catch (err) {
            throw err;
        }
    }

    static async updateUserPassword(userId, newPassword) {
        const t = await sequelize.transaction();
        try {
            const affectedRows = await User.update(
                { password: newPassword },
                {
                    where: {
                        id: userId,
                    },
                    transaction: t,
                    individualHooks: true,
                    validate: true,
                }
            );

            if (affectedRows[0] === 0)
                throw GlobalErrorsEnum.NO_USER_WITH(userId, false);

            await UserLimit.update(
                {
                    passwordChangedAt: new Date(),
                },
                {
                    where: {
                        userId,
                    },
                    transaction: t,
                }
            );

            await t.commit();
            return affectedRows;
        } catch (err) {
            // This can be not awaited
            await t.commit();
            throw err;
        }
    }

    static async deleteUser(userId, userName, userEmail, reason) {
        const t = await sequelize.transaction();
        try {
            const affectedRows = await User.destroy({
                where: {
                    id: userId,
                },
                transaction: t,
            });

            // Save that record
            await ModeratorActionService.addDeleteUserRecord(
                userName,
                userEmail,
                reason,
                t
            );

            if (affectedRows === 0) throw ErrorsEnum.COULD_NOT_DELETE;

            await t.commit();

            return affectedRows;
        } catch (err) {
            await t.rollback();
            throw err;
        }
    }

    static async banGenPassTokenBy(userId, banTill) {
        try {
            await UserLimit.update(
                {
                    canGenForgetPassAt: banTill,
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

    static async resetGenPassTokenLimit(userId) {
        try {
            const affectedRows = await UserLimit.update(
                { canGenForgetPassAt: null },
                { where: { userId } }
            );

            return affectedRows;
        } catch (err) {
            throw err;
        }
    }
}

export default AuthUserService;
