import APIError from "../../../util/APIError.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";
import User from "../models/user.js";

class ErrorsEnum {
    static COULD_NOT_DELETE = new APIError(
        "Couldn't delete the user or the user has been already deleted.",
        400,
        "SERVER_ERROR"
    );
}

class AuthUserService {
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
                    "gender",
                    "profilePic",
                    "brief",
                    "birthDate",
                    "followerCounts",
                    "followingCounts",
                    "articleCounts",
                    "fullNameChangeAt",
                    "passwordChangeAt",
                    "banTill",
                    "articlePublishedAt",
                    "canGenForgetPassAt",
                    "allowCookies",
                ],
                where: {
                    ...getByObj,
                },
            });

            if (!user) throw GlobalErrorsEnum.NO_USER_WITH(getBy, isEmail);

            return user;
        } catch (err) {
            throw err;
        }
    }

    static async updateUserPassword(userId, newPassword) {
        try {
            const affectedRows = await User.update(
                { password: newPassword, passwordChangeAt: new Date() },
                {
                    where: {
                        id: userId,
                    },
                }
            );

            if (affectedRows[0] === 0)
                throw GlobalErrorsEnum.NO_USER_WITH(userId, false);

            return affectedRows;
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

            if (affectedRows === 0) throw ErrorsEnum.COULD_NOT_DELETE;

            return affectedRows;
        } catch (err) {
            throw err;
        }
    }

    static async banGenPassTokenBy(userId, banTill) {
        try {
            await User.update(
                {
                    canGenForgetPassAt: banTill,
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

    static async resetGenPassTokenLimit(userId) {
        try {
            const affectedRows = await User.update(
                { canGenForgetPassAt: null },
                { where: { id: userId } }
            );

            return affectedRows;
        } catch (err) {
            throw err;
        }
    }
}

export default AuthUserService;
