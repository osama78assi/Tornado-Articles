// To solve issue of cicular imports made all them in one file
// I just add the reverse link in sequelize to be able to reach all related model to the current querying one
// like getting post from comment and getting comments from posts

const User = require("./user");
const Category = require("./category");
const Article = require("./article");

const Comment = require("./comment");
const Like = require("./like");
const FollowedFollower = require("./followedFollower");
const Notification = require("./notification");
const UserPreference = require("./userPreference");
const ArticleCategory = require("./articleCategory");
const PasswordToken = require("./passwordToken");

/////////////////////////// Articles

// Set the relations
// Many-to-one with users
Article.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" }); // DONE

// Many to many relation with categories
Article.belongsToMany(Category, { // // DONE
    through: ArticleCategory,
    foreignKey: "articleId",
});

// Many-to-Many relation with users through likes
Article.belongsToMany(User, { // DONE
    through: Like,
    foreignKey: "articleId",
    otherKey: "userId",
});

// Many-to-Many relation with users through comments
Article.belongsToMany(User, { // DONE
    through: { model: Comment, unique: false },
    foreignKey: "articleId",
});

/////////////////////////// User

// Set the relations
// one-to-many relation
User.hasMany(Article, { foreignKey: "userId", onDelete: "CASCADE" }); // DONE

// Many-to-many between users and aritcles through likes
User.belongsToMany(Article, { // DONE
    through: Like,
    foreignKey: "userId",
    otherKey: "articleId",
});

// Many-to-many between users and aritcles through commnets
User.belongsToMany(Article, { // DONE
    // Let the user comment times
    through: { model: Comment, unique: false },
    foreignKey: "userId",
});

// Many to Many relationship between users (like user A get an array with who is following)
User.belongsToMany(User, { // DONE
    through: FollowedFollower,
    foreignKey: "followerId",
    as: "followings",
});

// Who followed (like user A get an array with who follows A)
User.belongsToMany(User, { // DONE
    through: FollowedFollower,
    foreignKey: "followedId",
    as: "followers",
});

// Users have a one to many relationship with notifications
User.hasMany(Notification, { // DONE
    foreignKey: "userId",
    onDelete: "CASCADE",
});

// User and categories got many-to-many relationship (prefered categories)
User.belongsToMany(Category, {
    through: { model: UserPreference, unique: false },
    foreignKey: "userId",
    onDelete: "CASCADE",
});

// The relation between user and token is one to many (user can have many reset password token but not all of them is valid)
User.hasMany(PasswordToken, { // DONE
    foreignKey: "userId",
});

/////////////////////////// Category

// Set the relations
Category.belongsToMany(Article, { // DONE
    through: ArticleCategory,
    foreignKey: "categoryId",
});

Category.belongsToMany(User, { // DONE
    through: { model: UserPreference, unique: false },
    foreignKey: "categoryId",
    onDelete: "CASCADE",
});

/////////////////////////// Comments

// Self relation (one-to-many) between comments and replies
Comment.hasMany(Comment, { foreignKey: "replyToId" }); // DONE

// To get the parent from the replys
Comment.belongsTo(Comment, { foreignKey: "replyToId", as: "parent" }); // DONE

// One-to-Many relation between comments and articles
Comment.belongsTo(Article, { foreignKey: "articleId" }); // DONE

// Same for users
Comment.belongsTo(User, { foreignKey: "userId" }); // DONE

/////////////////////////// Likes

// The relation between users and like (mtm from users and articles through likes)
Like.belongsTo(User, { foreignKey: "userId" }); // NO NEED

// The relation between articles and like (mtm from users and articles through likes)
Like.belongsTo(Article, { foreignKey: "articleId" }); // NO NEED

/////////////////////////// Notifications

Notification.belongsTo(User, { // NO NEED
    foreignKey: "userId",
    onDelete: "CASCADE",
});

/////////////////////////// PasswordToken

PasswordToken.belongsTo(User, { // NO NEED
    foreignKey: "userId",
});

