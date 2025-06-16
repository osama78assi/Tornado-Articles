// This file mixes between bussenis logic and application logic
// But make update in the future are really simple by updating some constant from here

// Allow users pick how many rows he wants but really not more than 25
// It's good if we don't have CROS and someone tried to hungup our server by sending
// he wants 1000 rows. You can call it extra semi-security
const MAX_RESULTS = 25;

// When the client send a request with negative number as limit.
// I prefere to send the min results instead of error
const MIN_RESULTS = 10;

// The maximum size of profile images
const MAX_PROFILE_PIC_SIZE_MB = 5;

// The maximum size of (content/cover) image for articles
const MAX_ARTICLE_PICS_SIZE_MB = 5;

// The maximum number of content photos that the article can have
const MAX_ARTICLE_CONTENT_PICS_COUNT = 5;

// The maximum number of categories that the article can relate to
const MAX_CATEGORIES_ARTICLE_COUNT = 5;

// The maximum number of tags that the article can have
const MAX_TAGS_ARTICLE_COUNT = 10;

// In my recommendation system I will give score high priority over read counts
// but also consider it in my equation. As artilces the reads aren't a good way to rank
// an article or not it's really depend on likes and dislikes

/**
 *
 * @param {number} score
 * @param {number} readCounts
 * @returns {number}
 */
function UPDATE_RANK(score, readCounts) {
    const logReads = Math.log10(readCounts);
    const readScore = (logReads <= 0 ? 0.5 : logReads) * 2;

    // For positive score
    if (score > 0) return score * 0.5 + readScore;

    // For negative score article. It mat still usefull so don't make it negative
    return Math.abs(score) / (1.7 + Math.abs(score) * 0.1) + readScore;
}

// I will try to have the articles fresh as possible so I will reduce the (since) time by 6 hours
// Each time I get fewer resulsts. and I will keep reducing up to 8 times (about 2 days ago)
// So this values can be manipulated easily here. It's a good idea to publish some articles
// interact with it and check the recommendation from time to time and watch the memory and time
// usage for each query to adjust these values correctly
const RDUCE_SINCE_BY = 6;

const REDUCE_SINCE_TIMES = 8;

export {
    MAX_RESULTS,
    MIN_RESULTS,
    MAX_PROFILE_PIC_SIZE_MB,
    MAX_ARTICLE_PICS_SIZE_MB,
    MAX_ARTICLE_CONTENT_PICS_COUNT,
    MAX_CATEGORIES_ARTICLE_COUNT,
    MAX_TAGS_ARTICLE_COUNT,
    UPDATE_RANK,
    RDUCE_SINCE_BY,
    REDUCE_SINCE_TIMES,
};
