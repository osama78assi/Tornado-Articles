import fs from "fs/promises";
import path from "path";

class SingleFileError extends Error {
    constructor(message, options) {
        super(message, options);
        this.code = "SINGLE_FILE_EXPECTED";
    }
}

class FileLimitExceeded extends Error {
    constructor(message, options) {
        super(message, options);
        this.code = "FILE_LIMIT_EXCEEDED";
    }
}

/**
 * @typedef TornadoStorageSettings
 * @property {(req: import('express').Request, file: import('express-fileupload').UploadedFile) => Promise<string>} destination
 * @property {(req: import('express').Request, file: import('express-fileupload').UploadedFile) => Promise<string>} fileName
 */

class TornadoStorage {
    /**
     * Specify the callback functions for destination. Where the file should be stored. It must return the path for the file,
     * Same for fileName specify the file name you want. You must return the file name
     * @param {TornadoStorageSettings} options
     */
    constructor(options) {
        let { destination, fileName } = options;
        if (typeof destination !== "function")
            throw new Error(
                "'destination' must be an async function returns the destination where the file should be saved"
            );

        if (typeof fileName !== "function")
            throw new Error(
                "'fileName' must be an async function returns the file name"
            );

        this.destination = destination;
        this.fileName = fileName;
    }

    /**
     * Write the file
     * @param {import('express').Request} req
     * @param {import('express-fileupload').UploadedFile} file
     * @returns {Promise<{ filePath: string, newName: string }>} The file path in the disk
     */
    async writeData(req, file) {
        try {
            // Get the file name
            const newName = await this.fileName(req, file);

            // Get the path
            const dest = await this.destination(req, file);

            // Save the file name
            let filePath = path.join(dest, newName);

            // Write to the file
            await fs.writeFile(filePath, file.data);

            // Clear the file from memory
            delete file.data;

            return { filePath, newName };
        } catch (err) {
            throw err;
        }
    }
}

/**
 * Tornado Storage Middleware
 * @param {{storage: TornadoStorage, fieldName: string}}
 */
function singleTornadoFile({ storage, fieldName }) {
    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    async function uploadSingle(req, res, next) {
        try {
            // Get the file that parsed by express-fileupload
            let file = req.files?.[fieldName];

            // If the user send many throw an error (pass it to the next. Allowing the user to handle it if he needs)
            if (Array.isArray(file))
                return next(
                    new SingleFileError(
                        "Single file expected but got many files"
                    )
                );

            // If there is that file then call this
            if (file) {
                const { filePath, newName } = await storage.writeData(
                    req,
                    file
                );

                req.files[fieldName].diskPath = filePath;
                req.files[fieldName].newName = newName;
            }

            // Pass to the next middleware
            next();
        } catch (err) {
            next(err); // Let the developer handle the error
        }
    }

    return uploadSingle;
}

/**
 * Tornado Storage Middleware to store many fields
 * @param {{storage: TornadoStorage, fields: {name: string, maxCount: number}[]}}
 */
function fieldsTornadoFiles({ storage, fields }) {
    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     * @param {import('express').NextFunction} next
     */
    async function uploadFields(req, res, next) {
        try {
            for (let i = 0; i < fields.length; i++) {
                let field = fields[i];

                // Take the field
                let file = req.files?.[field.name];

                // If the file exists go ahead
                if (file && field.maxCount === 1) {
                    // When we expect one field and found many throw an error
                    if (Array.isArray(file) && file.length > 1) {
                        return next(
                            new SingleFileError(
                                "Expected one file but got more than one"
                            )
                        );
                    }

                    const { filePath, newName } = await storage.writeData(
                        req,
                        file
                    );

                    req.files[field.name].diskPath = filePath;
                    req.files[field.name].newName = newName;
                }

                // Here it must be many files
                if (file && field.maxCount > 1) {
                    if (Array.isArray(file) && file.length > field.maxCount)
                        return next(
                            new FileLimitExceeded(
                                `Expected ${field.maxCount} files. But received ${file.length}`
                            )
                        );

                    // Now loop over these files and upload them one by another
                    for (let i = 0; i < file.length; i++) {
                        let singleFile = file[i];
                        // Exctract tha path
                        const { filePath, newName } = await storage.writeData(
                            req,
                            singleFile
                        );

                        // Attach to the corresponding file
                        req.files[field.name][i].diskPath = filePath;
                        req.files[field.name][i].newName = newName;
                    }
                }
            }
            // Pass to the next middleware
            next();
        } catch (err) {
            return next(err); // Let the developer handle the error
        }
    }

    return uploadFields;
}

export {
    fieldsTornadoFiles,
    FileLimitExceeded,
    SingleFileError,
    singleTornadoFile,
    TornadoStorage,
};
