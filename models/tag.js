const { sequelize } = require("../config/sequelize");
const { Model, DataTypes } = require("sequelize");
const OperationError = require("../util/operationError");
const { normalizeTag } = require("../util/normalizeTags");

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
            validate: {
                NotEmptyString(value) {
                    if (value.length < 0)
                        throw new OperationError("The tag must not be empty");
                },
            },
            // unique: true,
        },
    },
    {
        sequelize,
        timestamps: false,
        createdAt: true,
        indexes: [
            {
                name: "tag_name_btree_index",
                fields: ["tagName"],
                using: "BTREE",
            },
        ],
        hooks: {
            beforeBulkCreate(tags) {
                tags.forEach((tag) => {
                    tag.dataValues.tagName = normalizeTag(
                        tag.dataValues.tagName
                    );
                });
            },
        },
    }
);

module.exports = Tag;
