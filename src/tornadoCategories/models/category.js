import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../config/sequelize.js";
import APIError from "../../../util/APIError.js";
import { generateSnowFlakeIdCategory } from "../../../config/snowFlake.js";

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
            unique: {
                name: "Unique_category",
                msg: "This category already exists.",
            }, // Cooking must not be repeated again in the db (example)
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
            beforeBulkCreate(categories) {
                categories.forEach((category) => {
                    category.dataValues.title = category.dataValues.title
                        .trim()
                        .toLocaleLowerCase();

                    if (typeof category.dataValues.description === "string")
                        category.dataValues.description =
                            category.dataValues.description
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

                if (
                    options.fields.includes("description") &&
                    typeof options.attributes.description === "string"
                ) {
                    options.attributes.description =
                        options.attributes.description
                            .trim()
                            .toLocaleLowerCase();
                }
            },
        },
    }
);

export default Category;
