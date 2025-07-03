import { fileTypeFromBuffer } from "file-type";
import { dirname, extname, join } from "path";
import { fileURLToPath } from "url";
import APIError from "../util/APIError.js";
import { TornadoStorage } from "../util/fileUploaderHandlers.js";
import { MAX_PROFILE_PIC_SIZE_MB } from "./settings.js";

const profilePicStorage = new TornadoStorage({
    destination: async (req, file) => {
        // Check the storage
        if (file.size > MAX_PROFILE_PIC_SIZE_MB * 1024 * 1024) {
            throw new APIError(
                `Profile picture size must not exceed ${MAX_PROFILE_PIC_SIZE_MB} MB`,
                413,
                "MAX_SIZE_EXCEEDED"
            );
        }

        if (!(await fileTypeFromBuffer(file.data)).mime.startsWith("image")) {
            // Check the real file type
            throw new APIError(
                "Only images accepted",
                400,
                "INVALID_IMAGE_TYPE"
            );
        }

        const __dirname = dirname(fileURLToPath(import.meta.url));

        return join(__dirname, "../uploads/profilePics");
    },
    fileName: async (req, file) => {
        return `${Date.now()}-${Math.floor(Math.random() * 10e9)}${extname(
            file.name
        )}`;
    },
});

export default profilePicStorage;
