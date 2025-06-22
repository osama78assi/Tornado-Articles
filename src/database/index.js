async function addAssociations() {
    // Imports are hoisted by default and this will cause Circular Dependency in my case so Lazy import can save the day
    const { default: User } = await import("../auth/models/user.js");
    const { default: Article } = await import(
        "../tornadoArticles/models/article.js"
    );
    const { default: CommentScore } = await import(
        "../tornadoComments/models/commentScore.js"
    );
    const { default: ArticleCategory } = await import(
        "../tornadoArticles/models/articleCategory.js"
    );
    const { default: ArticleImage } = await import(
        "../tornadoArticles/models/articleImage.js"
    );
    const { default: ArticleScore } = await import(
        "../tornadoArticles/models/articleScore.js"
    );
    const { default: ArticleTag } = await import(
        "../tornadoArticles/models/articleTag.js"
    );
    const { default: Category } = await import(
        "../tornadoCategories/models/category.js"
    );
    const { default: Comment } = await import(
        "../tornadoComments/models/comment.js"
    );
    const { default: Tag } = await import("../tornadoArticles/models/tag.js");
    const { default: UserPreference } = await import(
        "../tornadoUser/models/userPreference.js"
    );
    const { default: FollowedFollower } = await import(
        "../tornadoUser/models/followedFollower.js"
    );
    const { default: Notification } = await import(
        "../tornadoUser/models/notification.js"
    );
    const { default: PasswordToken } = await import(
        "../auth/models/passwordToken.js"
    );

    //////// Users Followings
    // Many to Many relationship between users (like user A get an array with who is following)
    User.belongsToMany(User, {
        through: FollowedFollower,
        foreignKey: "followerId",
        as: "followings",
        onDelete: "CASCADE",
    });

    // To be able to get user data form junction table also
    // (don't confuse here the followers is the real meaning)
    FollowedFollower.belongsTo(User, {
        foreignKey: "followerId",
        as: "follower",
        onDelete: "CASCADE",
    });

    // Who followed (like user A get an array with who follows A)
    User.belongsToMany(User, {
        through: FollowedFollower,
        foreignKey: "followedId",
        as: "followers",
        onDelete: "CASCADE",
    });

    // To be able to get user data form junction table also
    // (don't confuse here the followings is the real meaning)
    FollowedFollower.belongsTo(User, {
        foreignKey: "followedId",
        as: "following",
        onDelete: "CASCADE",
    });

    ////// Notification
    // Users have a one to many relationship with notifications
    User.hasMany(Notification, {
        foreignKey: "userId",
        onDelete: "CASCADE",
    });

    ////// PasswordTokens
    // The relation between user account and token is one to many (user can have many reset password token but not all of them is valid)
    User.hasMany(PasswordToken, {
        foreignKey: "userId",
        onDelete: "CASCADE",
    });

    ////////// Categoires
    // User and categories got many-to-many relationship (prefered categories)
    User.belongsToMany(Category, {
        through: { model: UserPreference, unique: false },
        foreignKey: "userId",
        onDelete: "CASCADE",
    });

    Category.belongsToMany(User, {
        through: { model: UserPreference, unique: false },
        foreignKey: "categoryId",
        onDelete: "CASCADE",
    });

    // Just to be able to get the categories from junction table
    UserPreference.belongsTo(Category, {
        foreignKey: "categoryId",
        onDelete: "CASCADE",
    });

    /////// Comments
    // Many-to-Many relation with users through comments
    Article.belongsToMany(User, {
        through: { model: Comment, unique: false },
        foreignKey: "articleId",
        onDelete: "SET NULL",
    });

    // Many-to-many between users and aritcles through commnets
    User.belongsToMany(Article, {
        // Let the user comment times
        through: { model: Comment, unique: false },
        foreignKey: "userId",
        onDelete: "SET NULL",
    });

    //// Scores comments
    // M:N between users and comments
    User.belongsToMany(Comment, {
        through: CommentScore,
        foreignKey: "userId",
        onDelete: "SET NULL",
    });

    Comment.belongsToMany(User, {
        through: CommentScore,
        foreignKey: "commentId",
        onDelete: "SET NULL",
    });

    // One-to-Many relation between comments and articles
    Comment.belongsTo(Article, {
        foreignKey: "articleId",
        onDelete: "SET NULL",
    });

    // Same for users
    Comment.belongsTo(User, { foreignKey: "userId", onDelete: "SET NULL" });

    // Self relation (one-to-many) between comments and replies (get the replies from the comment)
    Comment.hasMany(Comment, {
        foreignKey: "replyToId",
        as: "reply",
        onDelete: "CASCADE",
    });

    // To get the parent from the replys
    Comment.belongsTo(Comment, {
        foreignKey: "replyToId",
        as: "parent",
        onDelete: "CASCADE",
    });

    ///// Article Images
    // The article can have many images so 1:m relationship
    Article.hasMany(ArticleImage, {
        foreignKey: "articleId",
        onDelete: "CASCADE",
        as: "articleImages",
    });

    ArticleImage.belongsTo(Article, {
        foreignKey: "articleId",
        onDelete: "CASCADE",
    });

    ///// Articles Publisher

    // Many-to-one with users
    Article.belongsTo(User, {
        foreignKey: "userId",
        onDelete: "CASCADE",
        as: "publisher",
        onDelete: "SET NULL",
    });

    // one-to-many relation
    User.hasMany(Article, {
        foreignKey: "userId",
        onDelete: "CASCADE",
        as: "articles",
        onDelete: "SET NULL",
    });

    ///// Article Categories
    // Many to many relation with categories
    Article.belongsToMany(Category, {
        through: ArticleCategory,
        foreignKey: "articleId",
        onDelete: "CASCADE",
        as: "categories",
    });

    Category.belongsToMany(Article, {
        through: ArticleCategory,
        foreignKey: "categoryId",
        onDelete: "CASCADE",
    });

    /////////// Article Tags
    Article.belongsToMany(Tag, {
        through: ArticleTag,
        foreignKey: "articleId",
        onDelete: "CASCADE",
        as: "tags",
    });

    Tag.belongsToMany(Article, {
        through: ArticleTag,
        foreignKey: "tagId",
        onDelete: "CASCADE",
    });

    /////////// Artilce Scores
    // Many-to-Many relation with users through scores
    Article.belongsToMany(User, {
        through: ArticleScore,
        foreignKey: "articleId",
        otherKey: "userId",
        onDelete: "SET NULL",
    });

    // Many-to-many between users and aritcles through scores
    User.belongsToMany(Article, {
        through: ArticleScore,
        foreignKey: "userId",
        otherKey: "articleId",
        onDelete: "SET NULL",
    });
}

export default addAssociations;
