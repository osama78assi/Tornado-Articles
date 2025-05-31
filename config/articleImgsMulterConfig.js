const multer = require("multer");
const OperationError = require("../helper/operationError");
const path = require("path");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Reject the file if it's not an image
        if (!file.mimetype.startsWith("image/")) {
            return cb(
                new OperationError("Only image files are allowed!", 400),
                false
            );
        }

        cb(null, path.join(__dirname, "../uploads/articles"));
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname); // Keep original extension
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + ext);
    },
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
    },
});

module.exports = upload;
