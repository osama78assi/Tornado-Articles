import APIError from "./APIError.js";

/**
 * The user doesn't know what is the URL for his\her article images
 *
 * So there is placeholder to inject image URL on it.
 *
 * This is the responsibility of this function
 * @param {string[]} contentPics - The content pictures
 * @param {string} content - Content of the article
 *
 * @returns {string} The injected content
 */
export default function injectImgsInContent(contentPics, content) {
    // If the user uploaded images and didn't used them (or at least one of them)
    // and if he/she used the same image twice we should count it once
    const menthionedImgs = {};

    // Replace the placeholders for images with images URLs.
    // Allowing the user to add images in any place of the article
    if (contentPics.length !== 0) {
        content = content.replaceAll(/\{\{\d\}\}/g, function (placeholder) {
            // That number is the number of the image not the index
            const index = +placeholder[2] - 1;
            if (index >= contentPics.length || index < 0) return placeholder;
            else {
                menthionedImgs[contentPics[index]] = 1;
                return `![content-image-${index}](${contentPics[index]})`;
            }
        });
    }

    // Throw an error in case he didn't used them
    if (Object.keys(menthionedImgs).length < contentPics.length) {
        throw new APIError(
            "You've not used all the uploaded images",
            400,
            "VALIDATION_ERROR"
        );
    }
    return content;
}
