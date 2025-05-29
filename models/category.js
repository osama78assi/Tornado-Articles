const { sequelize } = require("../config/sequelize");
const { Model, DataTypes } = require("sequelize");

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
        timestamps: false, // No need to updatedAt and createdAt
    }
);

module.exports = Category;
