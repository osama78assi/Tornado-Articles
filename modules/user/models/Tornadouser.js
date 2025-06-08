const { sequelize } = require("../../../config/sequelize");
const { Model, DataTypes } = require("sequelize");

class TornadoUser extends Model {}

TornadoUser.init({
    userId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        references: { // Just becuase it's monolith now. When it's become Microservice it will not be foreign key
            model: "Users",
            key: "id"
        }
    },
    profilePic: {
        type: DataTypes.STRING(150),
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
}, {
    sequelize,
    timestamps: true
});


module.exports = TornadoUser;