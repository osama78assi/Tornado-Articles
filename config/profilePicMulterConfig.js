import multer, { diskStorage } from "multer";
import { dirname, extname, join } from "path";
import { fileURLToPath } from "url";
import APIError from "../util/APIError.js";
import { MAX_PROFILE_PIC_SIZE_MB } from "./settings.js";

const storage = diskStorage({
    destination: function (req, file, cb) {
        // Reject the file if it's not an image
        if (!file.mimetype.startsWith("image/")) {
            return cb(new APIError(
                "Only images are allowed.",
                400,
                "ONLY_IMAGES"
            ), false);
        }
        const __dirname = dirname(fileURLToPath(import.meta.url));

        cb(null, join(__dirname, "../uploads/profilePics"));
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
        fileSize: MAX_PROFILE_PIC_SIZE_MB * 1024 * 1024, // 5MB in my config
    },
});

export default upload;
