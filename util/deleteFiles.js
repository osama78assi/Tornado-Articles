import { unlink } from "fs/promises";

async function deleteFiles(files) {
    try {
        // Don't continue when there is no files
        if (!files) return;

        // This function is really for any files attached my express-fileupload and my custom configurations
        const keys = Object.keys(files);

        for (let key of keys) {
            if (Array.isArray(files[key])) {
                // Remove each file
                await Promise.all(
                    files[key].map(async (file) => {
                        // Check if uploaded
                        if (file?.diskPath) return unlink(file?.diskPath); // Return don't await it
                    })
                );
            } else {
                if (files[key]?.diskPath) await unlink(files[key]?.diskPath);
            }
        }
    } catch (err) {
        throw err;
    }
}

export default deleteFiles;
