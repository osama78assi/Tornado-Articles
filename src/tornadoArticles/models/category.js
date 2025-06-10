import { sequelize } from "../config/sequelize";
import { Model, DataTypes } from "sequelize";

class Category extends Model {}

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

export default Category;
