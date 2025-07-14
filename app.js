import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import device from "express-device";
import fileUpload from "express-fileupload";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import errorHandler from "./publicMiddlewares/errorHandler.js";
import authRouter from "./src/auth/route/authRoutes.js";
import articleRouter from "./src/tornadoArticles/routes/artcileRoutes.js";
import categoryRoutes from "./src/tornadoCategories/routes/categoryRoutes.js";
import topicRoutes from "./src/tornadoCategories/routes/topicRoutes.js";
import TornadoUserRoutes from "./src/tornadoUser/routes/userRoutes.js";
import APIError from "./util/APIError.js";

let app = express();

app.use(fileUpload());

// This is the body size. Make sure to send the files using FromData to keep this for only JSON body
app.use(express.json({ limit: "5MB" }));

app.use(cookieParser());

app.use(device.capture());

// app.use(express.urlencoded({ extended: true }));

const corsConfig = {
    origin: "http://127.0.0.1:5500",
    credentials: true,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
};

app.use(cors(corsConfig));

// API versions will be very usefull in future like adding ML to recommend articles
// While keep the choice for the user if he wants only see what is he prefered without making assumptions

// App routes
// Authentication
app.use("/api/v1", authRouter);
// Article
app.use("/api/v1", articleRouter);

// Comment
// app.use('/api/v1/articles/:articleId/comment');

// Categories I will just leave it here as it is because there is admin routes in this route
app.use("/api/v1", categoryRoutes);

// Topics
app.use("/api/v1", topicRoutes);

// Users
app.use("/api/v1", TornadoUserRoutes);

// Notifications
// app.use('/api/v1/users/:userId/notifications')

// Static files like photos, Js, CSS and HTML
const __dirname = dirname(fileURLToPath(import.meta.url));
app.use("/uploads", express.static(join(__dirname, "./uploads")));

// Not Found
app.all("{/*root}", function (req, res, next) {
    return next(
        new APIError(
            "The resource you are trying to access isn't found",
            404,
            "RESOURCE_NOT_FOUND"
        )
    );
});

// Error handler middleware
app.use(errorHandler);

export default app;
