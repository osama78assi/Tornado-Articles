const fs = require("fs/promises");
const path = require("path");
const isFileExists = require("./isFileExists");

/**
 *
 * @param {Express.Multer.File[]} files
 */
async function deleteFiles(files) {
    // Delete cover image if exists
    const fileName = files?.coverPic?.[0]?.filename;
    if (fileName) {
        const p = path.join(__dirname, "../uploads/articles", fileName);
        await fs.unlink(p);
    }

    // Content pics
    let contentPics = files?.contentPics;
    if (contentPics) {
        // Delete content images if exist
        await Promise.all(
            contentPics?.map(async (file) => {
                const fileName = file?.filename;
                const p = path.join(
                    __dirname,
                    "../uploads/articles",
                    fileName
                );
                await fs.unlink(p);
            })
        );
    }
}

module.exports = deleteFiles;
