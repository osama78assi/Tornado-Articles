const { sequelize } = require("../config/sequelize");
const { Model, DataTypes } = require("sequelize");

class Comment extends Model {}

// Here no one from the keys are primary because the user can comment many times to the same article

Comment.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
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
            type: DataTypes.UUID,
            references: {
                model: "Articles",
                key: "id",
            },
            onDelete: "CASCADE",
            allowNull: false,
        },
        replyToId: {
            type: DataTypes.UUID,
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
        indexes: [
            {
                // Fast for getting comments by article Id and sorted by created at
                name: "articleId_comment_btree_index",
                fields: ["articleId", "createdAt"],
                using: "BTREE",
            },
        ],
    }
);

// Self relation (one-to-many) between comments and replies (get the replies from the comment)
Comment.hasMany(Comment, { foreignKey: "replyToId", as: "reply" });

// To get the parent from the replys
Comment.belongsTo(Comment, { foreignKey: "replyToId", as: "parent" });



module.exports = Comment;
