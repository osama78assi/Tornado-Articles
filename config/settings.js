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

module.exports = {
    MAX_RESULTS,
    MIN_RESULTS,
    MAX_PROFILE_PIC_SIZE_MB,
    MAX_ARTICLE_PICS_SIZE_MB,
    MAX_ARTICLE_CONTENT_PICS_COUNT,
    MAX_CATEGORIES_ARTICLE_COUNT,
    MAX_TAGS_ARTICLE_COUNT,
};
