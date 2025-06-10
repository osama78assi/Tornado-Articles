import Tag from "../models/tag";
import { normalizeTags } from "../../../util/normalizeTags";
import { Op } from "sequelize";

class TagService {
    static async addTags(tags, transaction) {
        try {
            // Create the zip
            const zip = tags.map((tag) => {
                return {
                    tagName: tag,
                };
            });

            // Let the one who passed the transaction controle it
            const tagsData = await Tag.bulkCreate(zip, {
                transaction,
                ignoreDuplicates: true, // ON CONFLICT DO NOTHING
                returning: true,
            });

            return tagsData;
        } catch (err) {
            throw err;
        }
    }

    static async getTagsByNames(tags) {
        try {
            // Normalize the tags. To be able to find the tag
            tags = normalizeTags(tags);

            const tagsData = await Tag.findAll({
                where: {
                    tagName: {
                        [Op.in]: tags,
                    },
                },
            });

            return tagsData;
        } catch (err) {
            throw err;
        }
    }
}

export default TagService;