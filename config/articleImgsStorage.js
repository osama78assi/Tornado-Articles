import { fileTypeFromBuffer } from "file-type";
import { dirname, extname, join } from "path";
import { fileURLToPath } from "url";
import APIError from "../util/APIError.js";
import { TornadoStorage } from "../util/fileUploaderHandlers.js";
import GlobalErrorsEnum from "../util/globalErrorsEnum.js";
import {
    MAX_ARTICLE_PICS_SIZE_MB,
    SUPPORTED_IMAGES_MIMETYPES as supMimetypes,
} from "./settings.js";

const articleImgsStorage = new TornadoStorage({
    destination: async (req, file) => {
        // Check the storage
        if (file.size > MAX_ARTICLE_PICS_SIZE_MB * 1024 * 1024) {
            throw new APIError(
                `Artilc pictures size must not exceed ${MAX_ARTICLE_PICS_SIZE_MB} MB`,
                413,
                "MAX_SIZE_EXCEEDED"
            );
        }

        // Get the mimtype
        const mimetype = await fileTypeFromBuffer(file.data).mime;

        // Check the real file type
        if (mimetype !== undefined && !mimetype.startsWith("image") && !supMimetypes[mimetype])
            throw GlobalErrorsEnum.UNSUPPORTED_IMAGES(
                Object.values(supMimetypes)
            );

        const __dirname = dirname(fileURLToPath(import.meta.url));

        return join(__dirname, "../uploads/articles");
    },
    fileName: async (req, file) => {
        return `${Date.now()}-${Math.floor(Math.random() * 10e9)}${extname(
            file.name
        )}`;
    },
});

export default articleImgsStorage;
