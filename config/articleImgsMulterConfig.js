import multer, { diskStorage } from "multer";
import OperationError from "../util/operationError";
import { join, extname } from "path";
import { MAX_ARTICLE_PICS_SIZE_MB } from "./settings";

const storage = diskStorage({
    destination: function (req, file, cb) {
        // Reject the file if it's not an image
        if (!file.mimetype.startsWith("image/")) {
            return cb(
                new OperationError("Only image files are allowed!", 400),
                false
            );
        }

        cb(null, join(__dirname, "../uploads/articles"));
    },
    filename: function (req, file, cb) {
        const ext = extname(file.originalname); // Keep original extension
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + ext);
    },
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: MAX_ARTICLE_PICS_SIZE_MB * 1024 * 1024, // 5MB
    },
});

export default upload;
