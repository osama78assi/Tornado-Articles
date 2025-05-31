const { sequelize } = require("../config/sequelize");
const { Model, DataTypes, where } = require("sequelize");
const OperationError = require("../helper/operationError");
const { MIN_RESULTS, MAX_RESULTS } = require("../config/settings");

class Category extends Model {
    static async addCategories(categoriesTitles) {
        try {
            const titles = categoriesTitles.map((categoryTitle) => {
                return {
                    title: categoryTitle,
                };
            });

            const categories = await this.bulkCreate(titles);

            return categories;
        } catch (err) {
            throw err;
        }
    }

    static async deleteCategory(categoryId) {
        try {
            const affectedRows = await this.destroy({
                where: {
                    id: categoryId,
                },
            });

            if (affectedRows === 0)
                throw new OperationError(
                    "Category isn't exist or it's already deleted.",
                    400
                );

            return affectedRows;
        } catch (err) {
            throw err;
        }
    }

    static async updateCategoryTitle(categoryId, newTitle) {
        try {
            const updatedObject = await this.update(
                {
                    title: newTitle,
                },
                {
                    where: {
                        id: categoryId,
                    },
                    returning: true,
                }
            );

            return updatedObject[1][0];
        } catch (err) {
            throw err;
        }
    }

    static async getCategories(offset = 0, limit = MIN_RESULTS) {
        offset = offset < 0 ? 0 : offset;
        limit =
            limit < 0 ? MIN_RESULTS : limit > MAX_RESULTS ? MAX_RESULTS : limit;
        try {
            const categories = await this.findAll({
                offset,
                limit,
            });

            return categories;
        } catch (err) {
            throw err;
        }
    }
}

Category.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING(100),
            unique: {
                name: "Unique_category",
                msg: "This category already exists.",
            }, // Cooking must not be repeated again in the db (example)
            allowNull: false,
        },
    },
    {
        sequelize,
        timestamps: true, // No need to updatedAt
        updatedAt: false,
        hooks: {
            beforeBulkCreate(categories) {
                categories.forEach((category) => {
                    category.dataValues.title = category.dataValues.title
                        .trim()
                        .toLocaleLowerCase();
                });
            },
            beforeBulkUpdate(options) {
                // To check if the title is included into update statement
                if (options.fields.includes("title")) {
                    options.attributes.title = options.attributes.title
                        .trim()
                        .toLocaleLowerCase();
                }
            },
        },
    }
);

module.exports = Category;
