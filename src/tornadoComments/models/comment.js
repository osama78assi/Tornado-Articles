import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../config/sequelize.js";
import generateSnowFlakeId from "../../../config/snowFlake.js";
import APIError from "../../../util/APIError.js";

class Comment extends Model {}

// Here userId and articleId aren't unique because the user can comment many times to the same article

Comment.init(
    {
        id: {
            type: DataTypes.BIGINT,
            defaultValue: () => generateSnowFlakeId(),
            primaryKey: true,
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                isLongEnough(content) {
                    if (content.length === 0) {
                        throw new APIError(
                            "The comment must not be empty",
                            400,
                            "EMPTY_COMMENT"
                        );
                    }
                },
            },
        },
        userId: {
            type: DataTypes.UUID,
            references: {
                model: "Users", // Table name in the database
                key: "id",
            },
            onDelete: "CASCADE",
            allowNull: false,
        },
        articleId: {
            type: DataTypes.BIGINT,
            references: {
                model: "Articles",
                key: "id",
            },
            onDelete: "CASCADE",
            allowNull: false,
        },
        replyToId: {
            type: DataTypes.BIGINT,
            references: {
                model: Comment,
                key: "id",
            },
            onDelete: "CASCADE",
        },
    },
    {
        sequelize,
        timestamps: true,
    }
);

export default Comment;
