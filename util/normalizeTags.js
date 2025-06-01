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

module.exports = { normalizeTags, normalizeTag };
