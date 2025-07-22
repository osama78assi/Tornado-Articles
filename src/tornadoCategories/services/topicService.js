import { Op, QueryTypes } from "sequelize";
import { sequelize } from "../../../config/sequelize.js";
import APIError from "../../../util/APIError.js";
import GlobalErrorsEnum from "../../../util/globalErrorsEnum.js";
import Category from "../models/category.js";
import Topic from "../models/topic.js";
import TopicCategory from "../models/topicCategory.js";

class ErrorsEnum {
    static FAILED_TO_DELETE = new APIError(
        "Failed to delete or the topic has been deleted already.",
        400,
        "VALIDATION_ERROR"
    );

    static TOPIC_NOT_FOUND = (id) =>
        new APIError(`The topic with id '${id}' isn't found`, 400, "NOT_FOUND");
}

class TopicService {
    static async addTopics(topics) {
        const t = await sequelize.transaction();
        try {
            // Make an object with topic title that holds categories IDs
            // { [topicTitle]: categoryIDs }

            const categoriesIds = [];

            topics.forEach((topic, index) => {
                categoriesIds[topic.title.trim().toLowerCase()] =
                    topic.categoriesIds;

                // Delete the key categoryIds from the original array object
                delete topics[index].categoriesIds;
            });

            // Create the topics
            let topicsData = await Topic.bulkCreate(topics, {
                individualHooks: true,
                transaction: t,
                validate: true,
            });

            // Prepare the final array of objects
            let finallInsertArr = [];

            // Now loop over the topics
            topicsData.forEach((topic) => {
                let topicId = topic.dataValues.id;

                // Take that category by topic title. and create many objects to insert them in one go
                categoriesIds[topic.dataValues.title].map((categoryId) => {
                    finallInsertArr.push({
                        categoryId,
                        topicId,
                    });
                });
            });

            // Now insert the relations
            await TopicCategory.bulkCreate(finallInsertArr, {
                transaction: t,
            });

            // Commit
            await t.commit();

            return topicsData;
        } catch (err) {
            await t.rollback();
            if (err.name === "AggregateError") {
                // Extract my error. This is really one element but it's built with [Sybmol.iterator]
                for (const innerError of err.errors) {
                    // As there is a dark web here I found the dark error
                    let darkError = innerError?.errors?.errors[0].original;
                    if (darkError instanceof APIError) throw darkError;
                }
            }
            throw err;
        }
    }

    static async deleteTopic(topicId) {
        try {
            const deleteCounts = await Topic.destroy({
                where: {
                    id: topicId,
                },
            });

            if (deleteCounts === 0) throw ErrorsEnum.FAILED_TO_DELETE;

            return deleteCounts;
        } catch (err) {
            throw err;
        }
    }

    static async updateTopic(topicId, title, description) {
        try {
            let data = {};

            if (title !== undefined) data.title = title;
            if (description !== undefined) data.description = description;

            const [, topicData] = await Topic.update(data, {
                where: {
                    id: topicId,
                },
                returning: true,
            });

            return topicData[0];
        } catch (err) {
            throw err;
        }
    }

    static async getTopics(entryItemTitle, limit) {
        try {
            // Order by name ASC. Name is uniuqe so seek pagination will not face any issue
            const topics = await Topic.findAll({
                attributes: ["id", "title"],
                where: {
                    title: {
                        [Op.gt]: entryItemTitle,
                    },
                },
                limit,
                order: [["title", "ASC"]],
            });

            return topics;
        } catch (err) {
            throw err;
        }
    }

    static async getTopicsByCategory(entryItemTitle, limit, categoryId) {
        try {
            const topics = await Topic.findAll({
                where: {
                    title: {
                        [Op.gt]: entryItemTitle,
                    },
                },
                include: {
                    model: Category,
                    as: "categories",
                    attributes: [], // Don't get any category
                    through: {
                        attributes: [],
                    },
                    where: {
                        id: categoryId,
                    },
                },
                limit,
                order: [["title", "ASC"]],
                // benchmark: true,
                // logging: (sql, timeMs) => {
                //     loggingService.emit("query-time-usage", { sql, timeMs });
                // },
            });

            return topics;
        } catch (err) {
            throw err;
        }
    }

    static async getTopicDetails(topicId) {
        try {
            if (!/^\d+$/.test(String(topicId)))
                throw GlobalErrorsEnum.INVALID_BIGINT_ID("topicId");

            const topic = await Topic.findByPk(topicId);

            if (topic === null) throw ErrorsEnum.TOPIC_NOT_FOUND(topicId);

            return topic;
        } catch (err) {
            throw err;
        }
    }

    static async getPreferredTopics(
        entryItemTitle,
        entryInterestedCounts,
        limit
    ) {
        // Here is simpler than build it with sequelize (and maybe possible)
        const q = `
                SELECT "Topics".id, "Topics".title, "Topics".description,"Topics"."createdAt", COALESCE("Counts"."interestCounts", 0) as "interestCounts"
                FROM "Topics" LEFT JOIN (
                    SELECT "topicId", COUNT("topicId") as "interestCounts" FROM "UserTopics"
                    GROUP BY "topicId"
                ) AS "Counts"
                ON "Topics".id = "Counts"."topicId"
                WHERE
                COALESCE("Counts"."interestCounts", 0) < :entryInterestedCounts OR
                (COALESCE("Counts"."interestCounts", 0) = :entryInterestedCounts AND "Topics".title > :entryItemTitle)
                ORDER BY COALESCE("Counts"."interestCounts", 0) DESC, "Topics".title ASC
                LIMIT :limit;
            `;

        const topics = await sequelize.query(q, {
            type: QueryTypes.SELECT,
            replacements: {
                entryInterestedCounts,
                entryItemTitle,
                limit,
            },
            // benchmark: true,
            // logging: function (sql, timeMs) {
            //     loggingService.emit("query-time-usage", { sql, timeMs });
            // },
        });

        return topics;
    }

    static async moderatorSearchTopics(query, lastEntryTitle, limit) {
        try {
            // For the same reason it will be messy if builded with sequelize
            const q = `
                        SELECT "Topics".id, "Topics".title, "Topics".description,"Topics"."createdAt", COALESCE("Counts"."interestCounts", 0) as "interestCounts"
                        FROM "Topics" LEFT JOIN (
                            SELECT "topicId", COUNT("topicId") as "interestCounts" FROM "UserTopics"
                            GROUP BY "topicId"
                        ) AS "Counts"
                        ON "Topics".id = "Counts"."topicId"
                        WHERE
                        "Topics".title ILIKE :query AND "Topics".title > :lastEntryTitle
                        ORDER BY "Topics".title ASC
                        LIMIT :limit;
                    `;

            const results = await sequelize.query(q, {
                replacements: {
                    query: `${query}%`,
                    lastEntryTitle,
                    limit,
                },
                type: QueryTypes.SELECT,
            });

            return results;
        } catch (err) {}
    }

    static async userSearchTopics(query, lastEntryTitle, limit) {
        try {
            const results = await Topic.findAll({
                where: {
                    title: {
                        [Op.iLike]: `${query}%`,
                        [Op.gt]: lastEntryTitle,
                    },
                },
                order: [["title", "ASC"]],
                limit,
            });

            return results;
        } catch (err) {
            throw err;
        }
    }

    static async isTopicsContainedIn(topicsIds, categoriesIds) {
        try {
            // Cast the passed topicsIds as array. Group by topicId to remove duplicates
            // (when there is a topic related to all passed or at least two passed categories)
            const q = `
                SELECT ARRAY[:topicsIds]::BIGINT[] <@ (
                SELECT ARRAY_AGG("topicId") AS "topicsIds"
                FROM (
                        SELECT "topicId"
                        FROM "TopicCategories"
                        WHERE "categoryId" IN (:categoriesIds)
                        GROUP BY "topicId"
                    )
                ) AS "isFound";
            `;

            // Get any replacements that will not throw an error instead either null, true or false get returned
            const res = await sequelize.query(q, {
                type: QueryTypes.SELECT,
                replacements: {
                    topicsIds: topicsIds.length > 0 ? topicsIds : null,
                    categoriesIds:
                        categoriesIds.length > 0 ? categoriesIds : null,
                },
                // benchmark: true,
                // logging: function (sql, timeMs) {
                //     loggingService.emit("query-time-usage", { sql, timeMs });
                // },
            });

            return res[0].isFound;
        } catch (err) {
            throw err;
        }
    }

}

export default TopicService;
