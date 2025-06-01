const fs = require('fs/promises')

async function isFileExists(path) {
    try {
        await fs.access(path);
        return true
    } catch(err) {
        return false;
    }
}

module.exports = isFileExists;