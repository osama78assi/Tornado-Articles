import dotenv from "dotenv";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import loggingService from "./services/loggingService.js";

async function main() {
    const __dirname = dirname(fileURLToPath(import.meta.url));

    // Read the config file
    dotenv.config({
        path: join(__dirname, "./config.env"),
    });

    // All these files access .env variables so lazy import saves me again
    const { connectDB } = await import("./config/sequelize.js");
    // Connect to the database
    connectDB();

    // Get the app
    const app = await import("./app.js");

    let server = app.default.listen(
        process.env.PORT,
        process.env.HOST_NAME,
        () => {
            console.log(
                `Start listenting at http://${process.env.HOST_NAME}:${process.env.PORT}`
            );
        }
    );

    // Handle unhandled promise rejection
    process.on("unhandledRejection", function (err) {
        console.log(err);
        // log it to the logs file
        loggingService.emit("unexpected-rejection", { error: err });
    });

    process.on("uncaughtException", function (err) {
        console.log(err); // this will not crash the app
    });
}

main();
