const { sequelize } = require("../config/sequelize");
const { Model, DataTypes, QueryTypes } = require("sequelize");

// Models to add relations
const User = require("./user");
const Category = require("./category");
const ArticleLike = require("./articleLike");
const Comment = require("./comment");
const ArticleCategory = require("./articleCategory");
const ArticleImage = require("./articleImage");
const Tag = require("./tag");
const ArticleTag = require("./articleTag");

class Article extends Model {}

Article.init(
    {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
            validate: {
                len: {
                    args: 5,
                    msg: ["Article title should at least made of 5 chars"],
                },
            },
        },
        language: {
            type: DataTypes.ENUM("english"),
            allowNull: false,
            defaultValue: "english",
        },
        titleTsVector: {
            type: DataTypes.TSVECTOR,
            allowNull: false,
            // This got a trigger check config/sequelize.js
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                len: {
                    args: 10,
                    msg: "Title content should be at least made of 10 chars",
                },
            },
        },
        private: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
        userId: {
            type: DataTypes.UUID,
            references: {
                model: "Users",
                key: "id",
            },
            allowNull: false,
            onDelete: "CASCADE", // When the user delete his/her account. Delete his/her articles
        },
        coverImg: {
            type: DataTypes.STRING(150),
            allowNull: true,
        },
        likeCounts: { // To reduce queries count
            type: DataTypes.BIGINT,
            validate: {
                min: 0,
            },
            defaultValue: 0,
        },
        commentCounts: {
            type: DataTypes.BIGINT,
            validate: {
                min: 0,
            },
            defaultValue: 0,
        },
    },
    {
        sequelize,
        timestamp: true,
        indexes: [
            {
                name: "user_id_articles_btree_index", // Getting articles for a publisher is faster now
                fields: ["userId", "createdAt"],
                using: "BTREE",
            },
        ],
        hooks: {
            beforeCreate(article) {
                // Trim the content and title
                article.dataValues.title = article.dataValues.title.trim();
                // Normalize the header
                article.dataValues.title =
                    article.dataValues.title.toLocaleLowerCase();

                article.dataValues.content = article.dataValues.content.trim();
            },
            beforeUpdate(article) {
                // Trim the content and title
                if (article.changed("title")) {
                    article.dataValues.title = article.dataValues.title.trim();
                    article.dataValues.title =
                        article.dataValues.title.toLocaleLowerCase();
                }
                if (article.changed("content"))
                    article.dataValues.content =
                        article.dataValues.content.trim();
            },
        },
    }
);

///// Images
// The article can have many images so 1:m relationship
Article.hasMany(ArticleImage, {
    foreignKey: "articleId",
});

///// Users

// Many-to-one with users
Article.belongsTo(User, {
    foreignKey: "userId",
    onDelete: "CASCADE",
    as: "publisher",
});

// one-to-many relation
User.hasMany(Article, {
    foreignKey: "userId",
    onDelete: "CASCADE",
    as: "articles",
});

///// Categories
// Many to many relation with categories
Article.belongsToMany(Category, {
    through: ArticleCategory,
    foreignKey: "articleId",
});

// Set the relations
Category.belongsToMany(Article, {
    through: ArticleCategory,
    foreignKey: "categoryId",
});

/////////// Tags
Article.belongsToMany(Tag, {
    through: ArticleTag,
    foreignKey: "articleId",
});

Tag.belongsToMany(Article, {
    through: ArticleTag,
    foreignKey: "tagId",
});

/////////// Likes
// Many-to-Many relation with users through likes
Article.belongsToMany(User, {
    through: ArticleLike,
    foreignKey: "articleId",
    otherKey: "userId",
});

// Maybe needed when user want to know where he added likes so we will get the article from the like
// The relation between articles and like (mtm from users and articles through likes)
ArticleLike.belongsTo(Article, { foreignKey: "articleId" }); // NO NEED

// Many-to-many between users and aritcles through likes
User.belongsToMany(Article, {
    through: ArticleLike,
    foreignKey: "userId",
    otherKey: "articleId",
});

/////// Comments
// Many-to-Many relation with users through comments
Article.belongsToMany(User, {
    through: { model: Comment, unique: false },
    foreignKey: "articleId",
});

// Many-to-many between users and aritcles through commnets
User.belongsToMany(Article, {
    // Let the user comment times
    through: { model: Comment, unique: false },
    foreignKey: "userId",
});

// We want to get the user by comment or article by comment

// One-to-Many relation between comments and articles
Comment.belongsTo(Article, { foreignKey: "articleId" });

// Same for users
Comment.belongsTo(User, { foreignKey: "userId" });

module.exports = Article;
