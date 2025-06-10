import OperationError from "../../../util/operationError";
import User from "../models/authUser";

class ErrorEnum {
    static NO_USER_WITH = (getBy, isEmail = true) =>
        new OperationError(
            `There is no user with ${isEmail ? "email" : "id"} "${getBy}".`,
            404,
            "USER_NOT_FOUND"
        );

    static COULD_NOT_UPDATE = new OperationError(
        "Couldn't update",
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

            if (affectedRows[0] === 0)
                throw ErrorEnum.NO_USER_WITH(userId, false);

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
            if (affectedRows[0] === 0)
                throw ErrorEnum.NO_USER_WITH(userId, false);

            return affectedRows[1][0].dataValues.fullName;
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
}

export default AuthUserService;
