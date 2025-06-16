import { unlink } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

/**
 *
 * @param {Express.Multer.File[]} files
 */
async function deleteFiles(files) {
    // Delete cover image if exists
    const fileName = files?.coverPic?.[0]?.filename;
    const __dirname = dirname(fileURLToPath(import.meta.url))
    if (fileName) {
        const p = join(__dirname, "../uploads/articles", fileName);
        await unlink(p);
    }

    // Content pics
    let contentPics = files?.contentPics;
    if (contentPics) {
        // Delete content images if exist
        await Promise.all(
            contentPics?.map(async (file) => {
                const fileName = file?.filename;
                const p = join(__dirname, "../uploads/articles", fileName);
                await unlink(p);
            })
        );
    }
}

export default deleteFiles;
