import cookieParser from "cookie-parser";
import express from "express";
import path from "path";
import errorHandler from "./middlewares/errorHandler";
import articleRouter from "./src/tornadoArticles/routes/artcileRoutes";
import categoryRoutes from "./src/tornadoArticles/routes/categoryRoutes";
import TornadoUserRoutes from "./src/tornadoUser/routes/userRoutes";
import authRouter from "./src/authenticationAuthorization/route/authRoutes";
import OperationError from "./util/operationError";

let app = express();

// This is the body size. Make sure to send the files using FromData to keep this for only JSON body
app.use(express.json({ limit: "5MB" }));

app.use(cookieParser());

// API versions will be very usefull in future like adding ML to recommend articles
// While keep the choice for the user if he wants only see what is he prefered without making assumptions

// App routes
// Authentication
app.use("/api/v1/auth", authRouter);
// Article
app.use("/api/v1", articleRouter);

// Comment
// app.use('/api/v1/articles/:articleId/comment');

// Categories I will just leave it here as it is because there is admin routes in this route
app.use("/api/v1", categoryRoutes); // like admin/categories and /categories

// Users
app.use("/api/v1", TornadoUserRoutes); // may have search so ?=''
// It have two things admin can block users
// api/v1/admin/users or api/v1/users

// Notifications
// app.use('/api/v1/users/:userId/notifications')

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

export default app;
