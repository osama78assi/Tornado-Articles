import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../config/sequelize.js";
import { generateSnowFlakeIdCategory } from "../../../config/snowFlake.js";
import APIError from "../../../util/APIError.js";

class Category extends Model {}

Category.init(
    {
        id: {
            type: DataTypes.BIGINT,
            defaultValue: () => generateSnowFlakeIdCategory(),
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING(100),
            validate: {
                isLengthAccpeted(title) {
                    if (title.length < 3 || title.length > 100)
                        throw new APIError(
                            "The catgeory title must be at least 4 characters or 100 maximum",
                            400,
                            "VALIDATION_ERROR"
                        );
                },
            },
            // unique: true, // Cooking must not be repeated again in the db (example)
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING(350),
            validate: {
                isLengthAccpeted(description) {
                    if (
                        typeof description === "string" &&
                        description.length < 10 &&
                        description.length > 350
                    ) {
                        throw new Error(
                            "Category description's characters length must be less than 350 and larger than 10",
                            400,
                            "VALIDATION_ERROR"
                        );
                    }
                },
            },
            allowNull: true,
        },
    },
    {
        sequelize,
        timestamps: true, // No need to updatedAt
        updatedAt: false,
        indexes: [
            {
                name: "category_title_category_btree_index",
                fields: ["title"],
                type: "BTREE",
            },
        ],
        hooks: {
            beforeValidate(category) {
                // Normalize
                if (typeof category.dataValues?.title === "string") {
                    category.dataValues.title =
                        category.dataValues.title.trim().toLowerCase();
                }

                if (typeof category.dataValues?.description === "string") {
                    category.dataValues.description =
                        category.dataValues.description.trim().toLowerCase();
                }
            },
        },
    }
);

export default Category;
