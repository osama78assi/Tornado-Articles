const { sequelize } = require("../config/sequelize");
const { Model, DataTypes } = require("sequelize");
const generateSnowFlakeId = require("../config/snowFlake");

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

// Self relation (one-to-many) between comments and replies (get the replies from the comment)
Comment.hasMany(Comment, { foreignKey: "replyToId", as: "reply" });

// To get the parent from the replys
Comment.belongsTo(Comment, { foreignKey: "replyToId", as: "parent" });



module.exports = Comment;
