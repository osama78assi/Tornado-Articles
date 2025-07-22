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

export { extractCategoriesRanges, extractFollowingRanges, extractTopicsRanges };
