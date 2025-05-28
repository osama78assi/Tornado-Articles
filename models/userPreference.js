const { sequelize } = require("../config/sequelize");
const { Model, DataTypes, Op } = require("sequelize");

class UserPreference extends Model {
    static async addPreferredCategoriess(userId, categoriesIds) {
        try {
            // The records we want to add
            const zip = categoriesIds.map((categoryId) => {
                return {
                    userId,
                    categoryId,
                };
            });

            const data = await this.bulkCreate(zip);

            return data;
        } catch (err) {
            throw err;
        }
    }

    static async updatePreferredCategories(userId, toAdd = [], toDelete = []) {
        // Start unmanaged transaction
        const t = await sequelize.transaction();
        
        // Zip the toAdd
        const toAddZip = toAdd.map((categoryId) => {
            return {
                userId,
                categoryId,
            };
        });

        try {
            // If there is something to add
            // Add the new items. Pass the transaction
            toAddZip.length !== 0 &&
                (await this.bulkCreate(toAddZip, {
                    transaction: t,
                }));

            // If no errors happened let's do the same for delete
            toDelete.length !== 0 &&
                (await this.destroy({
                    where: {
                        categoryId: {
                            [Op.in]: toDelete, // If faced any ID from this array delete it
                        },
                    },
                    transaction: t,
                }));

            // No error happened ? commit
            await t.commit();
        } catch (err) {
            console.log(err)
            // any error ? rolback and throw that error
            await t.rollback()
            throw err;
        }
    }
}

UserPreference.init(
    {
        userId: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            references: {
                model: "Users",
                key: "id",
            },
            primaryKey: true,
        },
        categoryId: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            references: {
                model: "Categories",
                key: "id",
            },
            primaryKey: true,
        },
    },
    {
        sequelize,
        timestamps: false,
    }
);

module.exports = UserPreference;
