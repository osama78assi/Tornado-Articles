// This file mixes between bussenis logic and application logic
// But make update in the future are really simple by updating some constant from here

// Allow users pick how many rows he wants but really not more than 100
// It's good if someone tried to hungup our server by sending
// he wants 1000 rows. You can call it extra semi-security
const MAX_RESULTS = 100;

// When the client doesn't send a request with number as limit.
// I prefere to send the min results instead of error and to complete my logic
const MIN_RESULTS = 10;

// The maximum size of profile images
const MAX_PROFILE_PIC_SIZE_MB = 5;

// The maximum size of (content/cover) image for articles
const MAX_ARTICLE_PICS_SIZE_MB = 5;

// The maximum number of content photos that the article can have
const MAX_ARTICLE_CONTENT_PICS_COUNT = 5;

// The maximum number of categories that the article can relate to
const MAX_CATEGORIES_ARTICLE_COUNT = 2;

// The maximum number of topics that the article can relate to
const MAX_TOPICS_ARTICLE_COUNT = 5;

// The maximum number of tags that the article can have
const MAX_TAGS_ARTICLE_COUNT = 5;

// The maximum article chars counts. 50K is more than enough
const MAX_ARTICLE_CONTENT_LENGTH = 50000;

// Maybe in the future we will have many languages and this is used for searching (using ts_vector)
const SUPPORTED_ARTICLES_LANGUAGES = ["english"];

// Some limits for the user. Here how many times you want the user to be able to update the password
const UPDATE_PASSWORD_LIMIT = "15 days";

// How many times he can change his name
const UPDATE_NAME_LIMIT = "1 month";

// How many times the user can publsih an article
const PUBLISH_ARTICLE_LIMIT = "30 minutes";

// How many tokens the user can request at the same time to get first blcok time (5 minutes)
const PASSWORD_TOKEN_ALLOWED_COUNTS = 5;

// What is the period you want to block the user from requesting password tokens
const GENERATE_PASSWORD_TOKENS_LIMITS = [
    "1 minute",
    "5 minutes",
    "15 minutes",
    "12 hours",
];

// Here are the same because the lifetime is 30 minutes so these are adjusted by me. If you want you can edit it
// But keep in mind to check for the time range between them and the life time
// How many codes the user can request at the same time to get first blcok time (5 minutes)
const EMAIL_CODES_ALLOWED_COUNTS = 5;

// What is the period you want to block the user from requesting email tokens
const GENERATE_EMAIL_CODES_LIMITS = [
    "1 minute",
    "5 minutes",
    "15 minutes",
    "12 hours",
];

// May the roles grow in the future. But I've used them a lot so it's better for cache and use
const TORNADO_ROLES = ["admin", "moderator", "user"];

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
    const readScore = (logReads <= 0.5 ? 0.5 : logReads) * 2;

    // For positive score
    if (score > 0) return score * 0.5 + readScore;

    // For negative score article. It mat still usefull so don't make it negative
    return Math.abs(score) / (1.7 + Math.abs(score) * 0.1) + readScore;
}

// To solve what called re-ranking. As the API is REST then we I will use session based but the client will save that
// So he will tell me how many articles the user have browsed and I can't just ignore all of them they might be 10K IDK
// So I will take last 250 article to ignore
const ALLOWED_IGNORE_COUNT = 250;

// When we get artilces for followings (user want to see his/her followings articls)
// We need a min limit to pick range of them
const ARTICLES_FOLLOWINGS_MIN_LIMIT = 25;

// Same but this is max
const ARTICLES_FOLLOWINGS_MAX_LIMIT = 100;

// The same case we need to know how many categories we want to pick
// For authenticated users
const ARTICLES_CATEGORIES_MAX_LIMIT = 20;

// Min limit
const ARTICLES_CATEGORIES_MIN_LIMIT = 2;

// Min limit for topics
const ARTICLES_TOPICS_MIN_LIMIT = 2;

// Max limit for topics
const ARTICLES_TOPICS_MAX_LIMIT = 20;

export {
    ALLOWED_IGNORE_COUNT,
    ARTICLES_CATEGORIES_MAX_LIMIT,
    ARTICLES_CATEGORIES_MIN_LIMIT,
    ARTICLES_FOLLOWINGS_MAX_LIMIT,
    ARTICLES_FOLLOWINGS_MIN_LIMIT,
    ARTICLES_TOPICS_MAX_LIMIT,
    ARTICLES_TOPICS_MIN_LIMIT,
    EMAIL_CODES_ALLOWED_COUNTS,
    GENERATE_EMAIL_CODES_LIMITS,
    GENERATE_PASSWORD_TOKENS_LIMITS,
    MAX_ARTICLE_CONTENT_LENGTH,
    MAX_ARTICLE_CONTENT_PICS_COUNT,
    MAX_ARTICLE_PICS_SIZE_MB,
    MAX_CATEGORIES_ARTICLE_COUNT,
    MAX_PROFILE_PIC_SIZE_MB,
    MAX_RESULTS,
    MAX_TAGS_ARTICLE_COUNT,
    MAX_TOPICS_ARTICLE_COUNT,
    MIN_RESULTS,
    PASSWORD_TOKEN_ALLOWED_COUNTS,
    PUBLISH_ARTICLE_LIMIT,
    SUPPORTED_ARTICLES_LANGUAGES,
    TORNADO_ROLES,
    UPDATE_NAME_LIMIT,
    UPDATE_PASSWORD_LIMIT,
    UPDATE_RANK,
};
