const { sequelize } = require("../config/sequelize");
const { Model, DataTypes, QueryTypes, Op } = require("sequelize");
const OperationError = require("../util/operationError");
const { normalizeTag, normalizeTags } = require("../util/normalizeTags");

class Tag extends Model {
    static async addTags(tags, transaction) {
        try {
            // Create the zip
            const zip = tags.map((tag) => {
                return {
                    tagName: tag,
                };
            });

            // Let the one who passed the transaction controle it
            const tagsData = await this.bulkCreate(zip, {
                transaction,
                ignoreDuplicates: true, // ON CONFLICT DO NOTHING
                returning: true,
            });

            return tagsData;
        } catch (err) {
            throw err;
        }
    }

    static async getTagsByNames(tags) {
        try {
            // Normalize the tags. To be able to find the tag
            tags = normalizeTags(tags);

            const tagsData = await this.findAll({
                where: {
                    tagName: {
                        [Op.in]: tags,
                    },
                },
            });

            return tagsData;
        } catch (err) {
            throw err;
        }
    }
}

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
