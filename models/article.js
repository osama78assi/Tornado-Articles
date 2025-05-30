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

// TODO: Flexible search using GIN index and the powerfull postgreSQL engine
// ts_rank will give the search result a rank by number and quality of matches.
async function searchByTitle() {
    try {
        let searchFor = "HEllo there";
        // let query = `
        // SELECT *, ts_rank(to_tsvector('english', title), to_tsquery(:searchFor)) AS rank
        // from "Articles" WHERE to_tsvector('english', title) @@ to_tsquery(:searchFor)
        // ORDER BY rank DESC ,"createdAt" DESC
        // LIMIT :results OFFSET :startAt
        // `;

        // Optimized query
        let query = `
            SELECT sub.*, ts_rank(a.data, to_tsquery(:searchFor)) AS rank
            FROM (
                SELECT *, to_tsvector('english', title) AS data
                FROM "Articles"
            ) sub
            WHERE sub.data @@ to_tsquery(:searchFor)
            ORDER BY rank DESC, "createdAt" DESC
            LIMIT :results OFFSET :startAt;
        `;

        sequelize.query(query, {
            replacements: {
                searchFor: searchFor.replace(/\s+/g, " | "),
                startAt: 0,
                results: 10,
            },
            type: QueryTypes.SELECT,
        });
    } catch (err) {
        console.log(err);
    }
}

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
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        private: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
        },
        userId: {
            type: DataTypes.UUID,
            references: {
                model: "Users",
                key: "id",
            },
            allowNull: false,
        },
        coverImg: {
            type: DataTypes.STRING(150),
            allowNull: true,
        },
    },
    {
        sequelize,
        timestamp: true,
    }
);

///// Images
// The article can have many images so 1:m relationship
Article.hasMany(ArticleImage, {
    foreignKey: "articleId",
});

///// Users

// Many-to-one with users
Article.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });

// one-to-many relation
User.hasMany(Article, { foreignKey: "userId", onDelete: "CASCADE" });

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
