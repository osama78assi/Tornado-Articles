const express = require("express");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middlewares/errorHandler");
const authRouter = require("./routes/authRoutes");
const articleRouter = require("./routes/artcileRoutes");
const OperationError = require("./helper/operationError");
const path = require("path");
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const tagRoutes = require("./routes/tagRoutes");

let app = express();

app.use(express.json());

app.use(cookieParser());

// API versions will be very usefull in future like adding ML to recommend articles
// While keep the choice for the user if he wants only see what is he prefered without making assumptions

// App routes
// Authentication
app.use("/api/v1/auth", authRouter);
// Article
app.use("/api/v1/articles", articleRouter);
// app.use('/api/v1/admin/articles', articleRouter);
// Comment
// app.use('/api/v1/articles/:articleId/comment');

// Like
// app.use('/api/v1/articles/:aricleId/likes'); // Could have also /counts or /details

// Categories I will just leave it here as it is because there is admin routes in this route
app.use("/api/v1", categoryRoutes); // like admin/categories and /categories

// Users
app.use("/api/v1", userRoutes); // may have search so ?=''
// It have two things admin can block users
// api/v1/admin/users or api/v1/users

// Notifications
// app.use('/api/v1/users/:userId/notifications')

// Tags
app.use("api/v1/tags", tagRoutes);

// Static files like photos, Js, CSS and HTML
app.use("/uploads", express.static(path.join(__dirname, "./uploads")));

// Not Found
app.all("{/*root}", function (req, res, next) {
    return next(
        new OperationError(
            "The resource you are trying to access isn't found",
            404
        )
    );
});

// Error handler middleware
app.use(errorHandler);

module.exports = app;
