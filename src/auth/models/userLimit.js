import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../config/sequelize.js";

class UserLimit extends Model {}

UserLimit.init(
    {
        userId: {
            type: DataTypes.BIGINT,
            primaryKey: true,
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
    },
    {
        sequelize: sequelize,
        timestamps: false,
    }
);

export default UserLimit;
