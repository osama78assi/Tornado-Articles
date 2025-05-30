const { sequelize } = require("../config/sequelize");
const { Model, DataTypes } = require("sequelize");

class Tag extends Model {}

Tag.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        tagName: {
            type: DataTypes.STRING(50),
            allowNull: false,
            // unique: true,
        },
    },
    {
        sequelize,
        timestamps: false,
        createdAt: true,
    }
);

module.exports = Tag;
