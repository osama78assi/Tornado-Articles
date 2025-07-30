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
        // When user update the title (or language in the future) of the article there is a field that is used for searching
        // This will keep that field in sync with updates
        await sequelize.query(`
            CREATE OR REPLACE FUNCTION update_title_tsvector() RETURNS TRIGGER AS $$
            BEGIN
                IF NEW.title IS DISTINCT FROM OLD.title OR NEW.language IS DISTINCT FROM OLD.language THEN
                    NEW."titleTsVector" := to_tsvector(NEW.language::text::regconfig, NEW.title);
                END IF;
                RETURN NEW;
            END
            $$ LANGUAGE plpgsql;

            CREATE OR REPLACE TRIGGER tsvector_update BEFORE UPDATE
            ON "Articles" FOR EACH ROW EXECUTE FUNCTION update_title_tsvector();
        `);

        // When any new read or score update hit the article the fresh and optimal rank must be updated. This will keep them in sync
        await sequelize.query(`
            CREATE OR REPLACE FUNCTION update_article_ranks() RETURNS TRIGGER AS $$
            DECLARE
                newScore BIGINT;
                oldDate BIGINT;
                normalizedScore BIGINT;
            BEGIN
                -- Check if one of these fields changed
                IF NEW.score != OLD.score OR NEW."readsCounts" != OLD."readsCounts" THEN
                    -- Update fresh rank
                    oldDate := EXTRACT(EPOCH FROM OLD."createdAt")::BIGINT;

                    -- Normalize the score if negative
                    normalizedScore := CASE WHEN NEW.score < 0 THEN 0 ELSE NEW.score END;

                    -- Apply this formula and check if it's exceeded 12 hours later from it's publish date
                    newScore := oldDate + (0.2 * NEW."readsCounts") + (0.3 * normalizedScore);

                    IF newScore < (oldDate + 43200) THEN  -- 43200 seconds = 12 hours
                        NEW."freshRank" := newScore * 0.00000006;
                    ELSE
                        -- Keep it trend for 12 hours maximum
                        NEW."freshRank" := (oldDate + 43200) * 0.00000006;
                    END IF;

                    -- Update the optimal rank
                    NEW."optimalScore" := NEW."readsCounts" * 0.000003 + normalizedScore * 0.07;

                END IF;

                RETURN NEW;
            END;
            $$ LANGUAGE plpgsql;


            CREATE OR REPLACE TRIGGER update_article_ranks BEFORE UPDATE
            ON "Articles" FOR EACH ROW EXECUTE FUNCTION update_title_tsvector();
        `);
    } catch (err) {
        console.log(err);
    }
}

export { connectDB, sequelize };
