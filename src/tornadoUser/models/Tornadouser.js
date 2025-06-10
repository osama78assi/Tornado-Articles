import { sequelize } from "../../../config/sequelize";
import { Model, DataTypes } from "sequelize";


class TornadoUser extends Model {}

TornadoUser.init(
    {
        userId: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            references: {
                model: "Users",
                key: "id",
            },
        },
        brief: {
            type: DataTypes.STRING(150),
        },
        allowCookies: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
        followerCounts: {
            // Reduce queries count
            type: DataTypes.BIGINT,
            defaultValue: 0,
            validate: {
                min: 0,
            },
            allowNull: false,
        },
        followingCounts: {
            type: DataTypes.BIGINT,
            defaultValue: 0,
            validate: {
                min: 0,
            },
            allowNull: false,
        },
        articleCounts: {
            type: DataTypes.BIGINT,
            defaultValue: 0,
            validate: {
                min: 0,
            },
            allowNull: false,
        },
    },
    {
        sequelize,
        timestamps: true,
    }
);

export default TornadoUser;

/*
{
    userId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        references: {
            model: "Users",
            key: "id",
        },
    },
    brief: {
        type: DataTypes.STRING(150),
    },
    allowCookies: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
    },
    followerCounts: {
        // Reduce queries count
        type: DataTypes.BIGINT,
        defaultValue: 0,
        validate: {
            min: 0,
        },
        allowNull: false,
    },
    followingCounts: {
        type: DataTypes.BIGINT,
        defaultValue: 0,
        validate: {
            min: 0,
        },
        allowNull: false,
    },
    articleCounts: {
        type: DataTypes.BIGINT,
        defaultValue: 0,
        validate: {
            min: 0,
        },
        allowNull: false,
    },
},
*/