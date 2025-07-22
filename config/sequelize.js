import { Sequelize } from "sequelize";
import addAssociations from "../src/database/index.js";

const sequelize = new Sequelize(
    `postgres://${process.env.DB_USER_NAME}:${process.env.DB_PASS}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_DATABASE_NAME}`,
    { logging: false }
);

async function connectDB() {
    try {
        await sequelize.authenticate();

        await addAssociations();

        // Sync the current models with tables in database (if something not found in model add it to database not the opposite)
        await sequelize.sync({ alter: true });

        // Add indexes
        await addIndexes();

        // Add triggeres
        await addTriggers();

        // await sequelize.sync({ force: true });

        console.log("connected to database successfully");
    } catch (err) {
        console.log(err);
    }
}

// Write the indexes that you can't it do it in sequelize here
async function addIndexes(params) {
    try {
        // 1. Add GIN index in article's title for fast search
        // This will be very helpfull
        await sequelize.query(`
            CREATE INDEX IF NOT EXISTS article_title_fts_idx
            ON "Articles"
            USING gin ("titleTsVector");
        `);

        // 2. Add partial index on the articles to make recommendation faster
        // TODO: indexing for recommendations
        // await sequelize.query(`
        //     CREATE INDEX IF NOT EXISTS "public_artilce_btree_index"
        //     ON "Articles" (rank DESC, "createdAt" DESC)
        //     WHERE private = false;
        // `);
    } catch (err) {
        console.log(err);
    }
}

// Drop all indexes you've add
async function dropIndexes() {
    try {
        await sequelize.query(`DROP INDEX IF EXISTS article_title_trgm_idx;`);
    } catch (err) {
        console.log(err);
    }
}

// Write your triggers here
async function addTriggers() {
    try {
        await sequelize.query(`
            CREATE OR REPLACE FUNCTION update_title_tsvector() RETURNS trigger AS $$
            BEGIN
                IF NEW.title IS DISTINCT FROM OLD.title OR NEW.language IS DISTINCT FROM OLD.language THEN
                    NEW."titleTsVector" := to_tsvector(NEW.language::text::regconfig, NEW.title);
                END IF;
                RETURN NEW;
            END
            $$ LANGUAGE plpgsql;

            CREATE OR REPLACE TRIGGER tsvectorupdate BEFORE UPDATE
            ON "Articles" FOR EACH ROW EXECUTE FUNCTION update_title_tsvector();
        `);
    } catch (err) {
        console.log(err);
    }
}

export { connectDB, sequelize };
