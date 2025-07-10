/**
 * Take array of followings data and returns IDs array with interset rate ranges, first and last followers IDs
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

            followingsRates.firstPublisherRate =
                following?.dataValues?.interestRate;
        } else if (i === followings.length - 1) {
            followingsIdsRange.lastPublisherId =
                following?.dataValues?.followedId;

            followingsRates.lastPublisherRate =
                following?.dataValues?.interestRate;
        }
        return following?.dataValues?.followedId;
    });

    return { followingsIds: followings, followingsRates, followingsIdsRange };
}

/**
 * Take array of categories data and returns IDs array with interset rate ranges, first and last category IDs
 */
function extractCategoriesRanges(categories) {
    let categoriesRates = { firstCategoryRate: null, lastCategoryRate: null };
    let categoriesIdsRange = { firstCategoryId: null, lastCategoryId: null };

    categories = categories?.map((category, i) => {
        // Save rate range and IDs range
        if (i === 0) {
            categoriesIdsRange.firstCategoryId =
                category?.dataValues?.categoryId;

            categoriesRates.firstCategoryRate =
                category?.dataValues?.interestRate;
        } else if (i === categories.length - 1) {
            categoriesIdsRange.lastCategoryId =
                category?.dataValues?.categoryId;

            categoriesRates.lastCategoryRate =
                category?.dataValues?.interestRate;
        }
        return category?.dataValues?.categoryId;
    });

    return {
        categoriesIds: categories,
        categoriesRates,
        categoriesIdsRange,
    };
}

export { extractFollowingRanges, extractCategoriesRanges };
