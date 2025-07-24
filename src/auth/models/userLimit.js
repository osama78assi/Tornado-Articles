import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../config/sequelize.js";

class UserLimit extends Model {}

UserLimit.init(
    {
        userId: {
            type: DataTypes.BIGINT,
            primaryKey: true,
            references: {
                model: "Users",
                key: "id",
            },
            onDelete: "CASCADE",
        },
        passwordChangedAt: {
            // To keep track of changing timestamp
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
        fullNameChangedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
        articlePublishedAt: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
        banTill: {
            // Like a warnning to the user ban about 7 months from publishing articles
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
        canGenForgetPassAt: {
            // To block user a period of time when he/she ask many times for forget password token
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
        verifiedEmail: {
            // While this may not be limit directly but the user can't do any action till he verify his/her email
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
        canVerifyEmailAt: {
            // This is temprory value. When user ask for verify many times. This can be replaced with (work around) if you want
            type: DataTypes.DATE,
            defaultValue: null,
            allowNull: true,
        },
        updatedDateAt: {
            // The user can change his birth every year for example
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        },
    },
    {
        sequelize: sequelize,
        timestamps: false,
    }
);

export default UserLimit;
