import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../config/sequelize.js";
import { generateSnowFlakeIdCategory } from "../../../config/snowFlake.js";
import APIError from "../../../util/APIError.js";

class Topic extends Model {}

Topic.init(
    {
        id: {
            type: DataTypes.BIGINT,
            defaultValue: generateSnowFlakeIdCategory,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING(100),
            validate: {
                isLengthAccpeted(title) {
                    if (title.length < 1 || title.length > 100)
                        throw new APIError(
                            "The topic title must be at least 1 characters or 100 maximum",
                            400,
                            "VALIDATION_ERROR"
                        );
                },
            },
            // unique: true,
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
                            "Topic description's characters length must be less than 350 and larger than 10",
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
        timestamps: true,
        updatedAt: false,
        indexes: [
            {
                name: "topic_title_topic_btree_index",
                fields: ["title"],
                type: "BTREE",
            },
        ],

        hooks: {
            beforeValidate(topic) {
                // Normalize
                if (typeof topic.dataValues?.title === "string") {
                    topic.dataValues.title = topic.dataValues.title
                        .trim()
                        .toLowerCase();
                }

                if (typeof topic.dataValues?.description === "string") {
                    topic.dataValues.description = topic.dataValues.description
                        .trim()
                        .toLowerCase();
                }
            },
        },
    }
);

export default Topic;
