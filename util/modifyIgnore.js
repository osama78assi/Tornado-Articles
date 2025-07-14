import { ALLOWED_IGNORE_COUNT } from "../config/settings.js";

/**
 * Either modify ignore or not to match the ALLOWED_IGNORE_COUNT.
 *
 * If the ignore is bigger this function will take last ALLOWED_IGNORE_COUNT elements from the ignore array
 * @param {string[]} ignoreArr
 * @returns {number} the index from ignore list that function slice from. -1 in case the array didn't get modified
 */
export default function modifyIgnore(ignoreArr) {
    let entry = -1;

    // Extract last ALLOWED_IGNORE_COUNT if it's exceeded
    if (ignoreArr.length > ALLOWED_IGNORE_COUNT) {
        // To get the entry point of slicing
        entry = Math.abs(ALLOWED_IGNORE_COUNT - ignoreArr.length);
        ignoreArr.splice(entry);
    }

    return entry;
}


