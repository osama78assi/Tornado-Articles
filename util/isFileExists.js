import { access } from 'fs/promises';

async function isFileExists(path) {
    try {
        await access(path);
        return true
    } catch(err) {
        return false;
    }
}

export default isFileExists;