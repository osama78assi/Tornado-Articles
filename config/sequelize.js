const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(
    `postgres://${process.env.DB_USER_NAME}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE_NAME}`,
    { logging: false }
);

async function connectDB() {
    try {
        await sequelize.authenticate();
        /*
        these two require statements internall require
            1. users                      1
                userPrefernces            2
                notifiactions             3
                passwordToken             4
                category                  5
                followedFollower          6
                commentLies               7
            2. Articles                   8
                users                     X
                category                  X
                articleLike               9
                comment                   10
                articleCategory           11
                ArticleImage              12
        */
        require("../models/user");
        require("../models/article");

        // Sync the current models with tables in database (if something not found in model add it to database not the opposite)
        await sequelize.sync({ alter: true });
        addGinIndex();
        // dropGinIndex() // RUNS when you want to delete
        // await sequelize.sync({ force: true });
        console.log("connected to database successfully");
    } catch (err) {
        console.log(err);
    }
}

async function addGinIndex() {
    try {
        // Enable pg_trgm extension to be able to use GIN index for flexible searching in titles
        await sequelize.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);

        // add the index on title of the article
        await sequelize.query(`
            CREATE INDEX IF NOT EXISTS article_title_fts_idx
            ON "Articles"
            USING gin ("titleTsVector");
        `);
    } catch (err) {
        console.log(err);
    }
}

// Drop the GIN index
async function dropGinIndex() {
    try {
        await sequelize.query(`DROP INDEX IF EXISTS article_title_trgm_idx;`);
    } catch (err) {
        console.log(err);
    }
}

module.exports = { sequelize, connectDB };
