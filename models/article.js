const { sequelize } = require("../config/sequelize");
const { Model, DataTypes } = require("sequelize");

// Models to add relations
const User = require("./user");
const Category = require("./category");
const ArticleScore = require("./articleScore");
const Comment = require("./comment");
const ArticleCategory = require("./articleCategory");
const ArticleImage = require("./articleImage");
const Tag = require("./tag");
const ArticleTag = require("./articleTag");
const generateSnowFlakeId = require("../config/snowFlake");

class Article extends Model {}

Article.init(
    {
        id: {
            type: DataTypes.BIGINT,
            defaultValue: () => generateSnowFlakeId(),
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
        minsToRead: {
            // This will help in the recommendation system
            type: DataTypes.INTEGER,
            defaultValue: 5,
            validate: {
                min: 2,
            },
            allowNull: false,
        },
        readCounts: { // will help in recommendation system
            type: DataTypes.BIGINT,
            defaultValue: 0,
            validate: {
                min: 0,
            },
        },
        score: { // To reduce queries. Likes-Dislikes
            type: DataTypes.BIGINT,
            defaultValue: 0,
        },
        rank: {
            // Will help in recommendation system
            type: DataTypes.FLOAT,
            defaultValue: 0,
        },
    },
    {
        sequelize,
        timestamp: true,
        indexes: [
            {
                // There is two indexes here. in sequelize config file
                name: "rank_created_at_btree_index", // Getting posts for guests now is faster
                fields: [
                    { name: "rank", order: "DESC" },
                ],
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

/////////// Scores
// Many-to-Many relation with users through scores
Article.belongsToMany(User, {
    through: ArticleScore,
    foreignKey: "articleId",
    otherKey: "userId",
});

// Many-to-many between users and aritcles through scores
User.belongsToMany(Article, {
    through: ArticleScore,
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
