// This file mixes between bussenis logic and application logic
// But make update in the future are really simple by updating some constant from here

// TODO: I didn't measure it yet. But maybe adding this in Redis cache
// and reterive it from there is better than caching in JavaScript.
// And it will be more better when the application will be Microservices

// Allow users pick how many rows he wants but really not more than 100
// It's good if someone tried to hungup our server by sending
// he wants 1000 rows. You can call it extra semi-security
const MAX_RESULTS = 100;

// When the client doesn't send a request with number as limit.
// I prefere to send the min results instead of error and to complete my logic
const MIN_RESULTS = 10;

// After some search I found this supported images in many devices and browsers today
const SUPPORTED_IMAGES_MIMETYPES = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/bmp": "bmp",
    "image/x-icon": "ico",
    "image/svg+xml": "svg",
    "image/avif": "avif",
    "image/heic": "heic", // (partial browser support)
};

// The maximum size of profile images
const MAX_PROFILE_PIC_SIZE_MB = 5;

// The maximum size of (content/cover) image for articles
const MAX_ARTICLE_PICS_SIZE_MB = 5;

// The maximum number of content photos that the article can have
const MAX_ARTICLE_CONTENT_PICS_COUNT = 5;

// The maximum number of topics that the article can relate to
const MAX_TOPICS_ARTICLE_COUNT = 5;

// The maximum number of tags that the article can have
const MAX_TAGS_ARTICLE_COUNT = 5;

// The maximum article chars counts. 50K is more than enough
const MAX_ARTICLE_CONTENT_LENGTH = 50000;

// Maybe in the future we will have many languages and this is used for searching (using ts_vector)
const SUPPORTED_ARTICLES_LANGUAGES = ["english"];

// There is a lot of functions that fetchs article data so here is the required fields to fetch (in case wanna add more in the future)
const ARTICLE_ATTRIBUTES = [
    "id",
    "title",
    "createdAt",
    "coverImg",
    "language",
    "minsToRead",
    "headline",
    "score",
];

// Some limits for the user.
// The cooldown for how many times you want the user to be able to update the password
const UPDATE_PASSWORD_LIMIT = "15 days";

// The cooldown for how times he can change his name
const UPDATE_NAME_LIMIT = "1 month";

// The user can change his/her birth date every one year
const UPDATE_BIRTH_DATE_LIMIT = "1 year";

// The cooldown for how many times the user can publsih an article
const PUBLISH_ARTICLE_LIMIT = "30 minutes";

// The cooldown for how many times the user can update article X's title/language
const ARTICLE_TITLE_LANGUAGE_UPDATE_LIMIT = "30 minutes";

// The cooldown for how many times the user can update article X's content
const ARTICLE_CONTENT_UPDATE_LIMIT = "1 minute";

// The cooldown for how many times the user can change topics/categories for article's X
const ARTICLE_PREFERENCES_UPDATE_LIMIT = "3 minutes";

// The cooldown for how many times the user can change tags for article's X
const ARTICLE_TAGS_UPDATE_LIMIT = "5 minutes";

// Warning period is used when user get a ban for some reason. so he get a warning of deleting account if he violate the rules in X days
const BAN_WARNING_PERIOD = "1 month";

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

// When moderator take an action that will be stored in the database so this is the available actions for now
const MODERATOR_ACTIONS = [
    "warning",
    "ban",
    "delete account",
    "delete article",
    "other", // If moderator select this. he/she must explain everything in the reason
];

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
    ARTICLE_ATTRIBUTES,
    ARTICLE_CONTENT_UPDATE_LIMIT,
    ARTICLE_PREFERENCES_UPDATE_LIMIT,
    ARTICLE_TAGS_UPDATE_LIMIT,
    ARTICLE_TITLE_LANGUAGE_UPDATE_LIMIT,
    ARTICLES_CATEGORIES_MAX_LIMIT,
    ARTICLES_CATEGORIES_MIN_LIMIT,
    ARTICLES_FOLLOWINGS_MAX_LIMIT,
    ARTICLES_FOLLOWINGS_MIN_LIMIT,
    ARTICLES_TOPICS_MAX_LIMIT,
    ARTICLES_TOPICS_MIN_LIMIT,
    BAN_WARNING_PERIOD,
    EMAIL_CODES_ALLOWED_COUNTS,
    GENERATE_EMAIL_CODES_LIMITS,
    GENERATE_PASSWORD_TOKENS_LIMITS,
    MAX_ARTICLE_CONTENT_LENGTH,
    MAX_ARTICLE_CONTENT_PICS_COUNT,
    MAX_ARTICLE_PICS_SIZE_MB,
    MAX_PROFILE_PIC_SIZE_MB,
    MAX_RESULTS,
    MAX_TAGS_ARTICLE_COUNT,
    MAX_TOPICS_ARTICLE_COUNT,
    MIN_RESULTS,
    MODERATOR_ACTIONS,
    PASSWORD_TOKEN_ALLOWED_COUNTS,
    PUBLISH_ARTICLE_LIMIT,
    SUPPORTED_ARTICLES_LANGUAGES,
    SUPPORTED_IMAGES_MIMETYPES,
    TORNADO_ROLES,
    UPDATE_BIRTH_DATE_LIMIT,
    UPDATE_NAME_LIMIT,
    UPDATE_PASSWORD_LIMIT,
};
