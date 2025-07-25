import { unlink } from "fs/promises";
import { ALLOWED_IGNORE_COUNT } from "../../../config/settings.js";
import APIError from "../../../util/APIError.js";

/**
 *
 * @param {'admin' | 'moderator' | 'user'} role
 * @returns {boolean} Wether the role can see the private articles or not
 */
function canViewArticle(role) {
    if (["admin", "moderator"].includes(role)) return true;

    return false;
}

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

/**
 * Take a string contains speciall chars for regular expression. And escape them to be matched in another regular expression
 * @param {string} str
 * @returns {string} same string but with with escaped chars
 */
function escapeRegexSpecial(str) {
    // this speciall \\$& means add \ before $& which is a placeholder to the matched string using replace
    // "cat and dog".replace(\(cat|dog)\, "($&)") -> "(cat) and (dog)"
    return str.replace(
        /(\.|\*|\+|\?|\^|\$|\{|\}|\(|\)|\\|\[|\]|\/)/g,
        (matched) => {
            return "\\" + matched;
        }
    );
}

/**
 * Takes an array of followings data and returns IDs array with interset rate ranges, first and last followers IDs
 *
 */
function extractFollowingRanges(followings) {
    let followingsRates = { firstPublisherRate: null, lastPublisherRate: null };
    let followingsIdsRange = { firstPublisherId: null, lastPublisherId: null };

    followings = followings?.map((following, i) => {
        // Save rate range and IDs range
        if (i === 0) {
            followingsIdsRange.firstPublisherId =
                following?.dataValues?.followedId;

            followingsRates.firstPublisherRate = String(
                following?.dataValues?.interestRate
            ); // Always convert it to string
        } else if (i === followings.length - 1) {
            followingsIdsRange.lastPublisherId =
                following?.dataValues?.followedId;

            followingsRates.lastPublisherRate = String(
                following?.dataValues?.interestRate
            );
        }
        return following?.dataValues?.followedId;
    });

    return { followingsIds: followings, followingsRates, followingsIdsRange };
}

/**
 * Takes an array of categories data and returns IDs array with interset rate ranges, first and last category IDs
 */
function extractCategoriesRanges(categories) {
    let categoriesRates = { firstCategoryRate: null, lastCategoryRate: null };
    let categoriesIdsRange = { firstCategoryId: null, lastCategoryId: null };

    categories = categories?.map((category, i) => {
        // Save rate range and IDs range
        if (i === 0) {
            categoriesIdsRange.firstCategoryId =
                category?.dataValues?.categoryId;

            categoriesRates.firstCategoryRate = String(
                category?.dataValues?.interestRate
            );
        } else if (i === categories.length - 1) {
            categoriesIdsRange.lastCategoryId =
                category?.dataValues?.categoryId;

            categoriesRates.lastCategoryRate = String(
                category?.dataValues?.interestRate
            );
        }
        return category?.dataValues?.categoryId;
    });

    return {
        categoriesIds: categories,
        categoriesRates,
        categoriesIdsRange,
    };
}

/**
 * Takes an array of topics data and returns IDs array with interset rate ranges, first and last topics IDs
 */
function extractTopicsRanges(topics) {
    let topicsRates = { firstTopicRate: null, lastTopicRate: null };
    let topicsIdsRange = { firstTopicId: null, lastTopicId: null };

    topics = topics?.map((topic, i) => {
        // Save rate range and IDs range
        if (i === 0) {
            topicsIdsRange.firstTopicId = topic?.dataValues?.topicId;

            topicsRates.firstTopicRate = String(
                topic?.dataValues?.interestRate
            );
        } else if (i === topics.length - 1) {
            topicsIdsRange.lastTopicId = topic?.dataValues?.topicId;

            topicsRates.lastTopicRate = String(topic?.dataValues?.interestRate);
        }
        return topic?.dataValues?.topicId;
    });

    return {
        topicsIds: topics,
        topicsRates,
        topicsIdsRange,
    };
}

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
function injectImgsInContent(contentPics, content) {
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

/**
 * Either modify ignore or not to match the ALLOWED_IGNORE_COUNT.
 *
 * If the ignore is bigger this function will take last ALLOWED_IGNORE_COUNT elements from the ignore array
 * @param {string[]} ignoreArr
 * @returns {number} the index from ignore list that function slice from. -1 in case the array didn't get modified
 */
function modifyIgnore(ignoreArr) {
    let entry = -1;

    // Extract last ALLOWED_IGNORE_COUNT if it's exceeded
    if (ignoreArr.length > ALLOWED_IGNORE_COUNT) {
        // To get the entry point of slicing
        entry = Math.abs(ALLOWED_IGNORE_COUNT - ignoreArr.length);
        ignoreArr.splice(entry);
    }

    return entry;
}

/**
 *
 * @param {string} tag
 */
function normalizeTag(tag) {
    return tag.trim().toLowerCase().replaceAll(/\s+/g, "-"); // Replace all spaces with -
}

/**
 *
 * @param {string[]} tags
 */
function normalizeTags(tags) {
    return tags.map((tag) => normalizeTag(tag));
}

export {
    canViewArticle,
    deleteFiles,
    escapeRegexSpecial,
    extractCategoriesRanges,
    extractFollowingRanges,
    extractTopicsRanges,
    injectImgsInContent,
    modifyIgnore,
    normalizeTag,
    normalizeTags,
};
