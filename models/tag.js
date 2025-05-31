const { sequelize } = require("../config/sequelize");
const { Model, DataTypes, QueryTypes } = require("sequelize");

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
                fields: ['tagName'],
                using: "BTREE"
            }
        ]
    }
);

module.exports = Tag;
