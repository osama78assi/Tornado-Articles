function addAssociations() {
    // Models to add relations
    const TornadoUser = require("../tornadoUser/models/Tornadouser");
    const Category = require("../tornadoArticles/models/category");
    const ArticleScore = require("../tornadoArticles/models/articleScore");
    const Comment = require("../tornadoArticles/models/comment");
    const ArticleCategory = require("../tornadoArticles/models/articleCategory");
    const ArticleImage = require("../tornadoArticles/models/articleImage");
    const Tag = require("../tornadoArticles/models/tag");
    const ArticleTag = require("../tornadoArticles/models/articleTag");
    const AuthUser = require("../authenticationAuthorization/models/authUser");

    //////// Users Followings
    // Many to Many relationship between users (like user A get an array with who is following)
    TornadoUser.belongsToMany(TornadoUser, { // DONE
        through: FollowedFollower,
        foreignKey: "followerId",
        as: "followings",
    });

    // To be able to get user data form junction table also
    // (don't confuse here the followers is the real meaning)
    TornadoUser.belongsTo(TornadoUser, { // DONE
        foreignKey: "followerId",
        as: "follower",
    });

    // Who followed (like user A get an array with who follows A)
    TornadoUser.belongsToMany(TornadoUser, { // DONE
        through: FollowedFollower,
        foreignKey: "followedId",
        as: "followers",
    });

    // To be able to get user data form junction table also
    // (don't confuse here the followings is the real meaning)
    FollowedFollower.belongsTo(TornadoUser, { // DONE
        foreignKey: "followedId",
        as: "following",
    });

    ////// Notification
    // Users have a one to many relationship with notifications
    TornadoUser.hasMany(Notification, { // DONE
        foreignKey: "userId",
        onDelete: "CASCADE",
    });

    ////// PasswordTokens
    // The relation between user account and token is one to many (user can have many reset password token but not all of them is valid)
    AuthUser.hasMany(PasswordToken, { // DONE
        foreignKey: "userId",
    });

    ////////// Categoires
    // User and categories got many-to-many relationship (prefered categories)
    TornadoUser.belongsToMany(Category, { // DONE
        through: { model: UserPreference, unique: false },
        foreignKey: "userId",
        onDelete: "CASCADE",
    });

    Category.belongsToMany(TornadoUser, { // DONE
        through: { model: UserPreference, unique: false },
        foreignKey: "categoryId",
        onDelete: "CASCADE",
    });

    /////// Comments
    // Many-to-Many relation with users through comments
    Article.belongsToMany(TornadoUser, {
        through: { model: Comment, unique: false },
        foreignKey: "articleId",
    });

    // Many-to-many between users and aritcles through commnets
    TornadoUser.belongsToMany(Article, {
        // Let the user comment times
        through: { model: Comment, unique: false },
        foreignKey: "userId",
    });

    //// Scores comments
    // M:N between users and comments
    TornadoUser.belongsToMany(Comment, { // DONE
        through: CommentScore,
        foreignKey: "userId",
    });

    Comment.belongsToMany(TornadoUser, { // DONE
        through: CommentScore,
        foreignKey: "commentId",
    });

    // One-to-Many relation between comments and articles
    Comment.belongsTo(Article, { foreignKey: "articleId" });

    // Same for users
    Comment.belongsTo(User, { foreignKey: "userId" });

    // Self relation (one-to-many) between comments and replies (get the replies from the comment)
    Comment.hasMany(Comment, { foreignKey: "replyToId", as: "reply" });

    // To get the parent from the replys
    Comment.belongsTo(Comment, { foreignKey: "replyToId", as: "parent" });

    ///// Article Images
    // The article can have many images so 1:m relationship
    Article.hasMany(ArticleImage, { // DONE
        foreignKey: "articleId",
    });

    ///// Articles Publisher

    // Many-to-one with users
    Article.belongsTo(TornadoUser, { // DONE
        foreignKey: "userId",
        onDelete: "CASCADE",
        as: "publisher",
    });

    // one-to-many relation
    TornadoUser.hasMany(Article, { // DONE
        foreignKey: "userId",
        onDelete: "CASCADE",
        as: "articles",
    });

    ///// Article Categories
    // Many to many relation with categories
    Article.belongsToMany(Category, { // DONE
        through: ArticleCategory,
        foreignKey: "articleId",
    });

    Category.belongsToMany(Article, { // DONE
        through: ArticleCategory,
        foreignKey: "categoryId",
    });

    /////////// Article Tags
    Article.belongsToMany(Tag, { // DONE
        through: ArticleTag,
        foreignKey: "articleId",
    });

    Tag.belongsToMany(Article, { // DONE
        through: ArticleTag,
        foreignKey: "tagId",
    });

    /////////// Artilce Scores
    // Many-to-Many relation with users through scores
    Article.belongsToMany(TornadoUser, { // DONE
        through: ArticleScore,
        foreignKey: "articleId",
        otherKey: "userId",
    });

    // Many-to-many between users and aritcles through scores
    TornadoUser.belongsToMany(Article, { // DONE
        through: ArticleScore,
        foreignKey: "userId",
        otherKey: "articleId",
    });
}

export default addAssociations;
