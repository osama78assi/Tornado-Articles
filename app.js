import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import device from "express-device";
import fileUpload from "express-fileupload";
import { fileTypeFromBuffer } from "file-type";
import path, { dirname, join } from "path";
import { fileURLToPath } from "url";
import {
    fieldsTornadoFiles,
    SingleFileError,
    TornadoStorage,
} from "./util/fileUploaderHandlers.js";
import errorHandler from "./publicMiddlewares/errorHandler.js";
import authRouter from "./src/auth/route/authRoutes.js";
import articleRouter from "./src/tornadoArticles/routes/artcileRoutes.js";
import categoryRoutes from "./src/tornadoCategories/routes/categoryRoutes.js";
import TornadoUserRoutes from "./src/tornadoUser/routes/userRoutes.js";
import APIError from "./util/APIError.js";
import measureHandlerTime from "./util/measureHandlerTime.js";

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

const storage = new TornadoStorage({
    destination: async (req, file) => {
        // Check the real file type
        if (!(await fileTypeFromBuffer(file.data)).mime.startsWith("image")) {
            throw new APIError(
                "Only images accepted",
                400,
                "INVALID_IMAGE_TYPE"
            );
        }

        const __dirname = dirname(fileURLToPath(import.meta.url));

        return path.join(__dirname, "./uploads/articles");
    },
    fileName: async (req, file) => {
        return `${Date.now()}-${Math.floor(Math.random() * 10e9)}.jpg`;
    },
});

app.post(
    "/test",
    measureHandlerTime(
        async function (req, res, next) {
            fieldsTornadoFiles({
                storage,
                fields: [
                    { name: "profilePic", maxCount: 1 },
                    { name: "cover", maxCount: 3 },
                ],
            })(req, res, function (err) {
                if (err) {
                    if (err instanceof SingleFileError) {
                        return next(
                            new APIError(
                                "Expected one profile picture but recieved more than one",
                                400,
                                "VALIDATION_ERROR"
                            )
                        );
                    }
                    return next(err);
                }
                // Call the next
                next();
            });
        },
        "file uploader"
    ),
    async (req, res, next) => {
        console.log("\n\n###########\n", req.files, "\n\n###########\n");
        next();
    },
    (req, res) => {
        console.log("\n\n###########\n", "END AGAIN", "\n\n###########\n");
        res.status(200).json({
            message: "success",
        });
    }
);

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
