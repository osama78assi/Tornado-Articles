import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../config/sequelize.js";
import { normalizeTag } from "../../../util/normalizeTags.js";
import APIError from "../../../util/APIError.js";

class Tag extends Model {}

Tag.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        tagName: {
            type: DataTypes.STRING(75),
            allowNull: false,
            validate: {
                validateLength(value) {
                    if (value.length < 0 || value > 75)
                        throw new APIError(
                            "The tag must not be empty and 75 characters maximum",
                            400,
                            "VALIDATION_ERROR"
                        );
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

export default Tag;
