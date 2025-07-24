import { DataTypes, Model } from "sequelize";
import { sequelize } from "../../../config/sequelize.js";
import { MODERATOR_ACTIONS } from "../../../config/settings.js";
import { generateSnowFlakeIdPlatform } from "../../../config/snowFlake.js";
import APIError from "../../../util/APIError.js";
import isNull from "../../../util/isNull.js";

class ModeratorAction extends Model {}

ModeratorAction.init(
    {
        id: {
            type: DataTypes.BIGINT,
            defaultValue: generateSnowFlakeIdPlatform,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.BIGINT,
            allowNull: true,
            references: {
                model: "Users",
                key: "id",
            },
            onDelete: "SET NULL",
            onUpdate: "CASCADE",
        },
        userName: {
            // Repeated this because you may delete an account so it will be deleted so maybe the admin want to keep data in the platform
            type: DataTypes.STRING(150),
            allowNull: false,
        },
        userEmail: {
            // Same reason here. And this isn't unique because the same user may get banned twice
            type: DataTypes.STRING(254),
            allowNull: false,
            validate: {
                isEmail: true,
            },
        },
        actionType: {
            type: DataTypes.ENUM(...MODERATOR_ACTIONS), // When you get more actions types add them here
            allowNull: false,
        },
        duration: {
            type: DataTypes.STRING(100), // Like ban for 2 days
            allowNull: true, // When deleting account there is no duration or can be permanent
        },
        reason: {
            type: DataTypes.STRING(350), // Explain why user X got (ban, delete account) that may help in data analysis
            allowNull: false, // You must provide a reason
            validate: {
                isBigEnough(reason) {
                    if (reason.length < 4)
                        throw new APIError(
                            "The reason must be at least 4 characters length",
                            400,
                            "VALIDATION_ERROR"
                        );
                },
            },
        },
    },
    {
        sequelize,
        createdAt: true,
        updatedAt: false,
        // TODO: analyze and add the index for userId may help when user with id X break rules many times and moderator want to check if he has a history
        hooks: {
            beforeValidate(instance) {
                if (!isNull(instance.dataValues.reason))
                    instance.dataValues.reason =
                        instance.dataValues.reason.trim();

                if (!isNull(instance.dataValues.userName))
                    instance.dataValues.userName =
                        instance.dataValues.userName.trim();
                // User email is trimmed. check publishAction.validate.js and the other publisher will be automated from user table

                if (!isNull(instance.dataValues.actionType))
                    instance.dataValues.actionType =
                        instance.dataValues.actionType.trim().toLowerCase();

                // This field is nullable
                if (!isNull(instance.dataValues.duration))
                    instance.dataValues.duration = instance.dataValues.duration
                        .trim()
                        .toLowerCase();
            },
        },
    }
);

export default ModeratorAction;
