import path from "path";
import dotenv from "dotenv";

// Read the config file
dotenv.config({
    path: path.join(__dirname, "./config.env"),
});

// Now after reading dotEnv require the sequelize module
const { connectDB } = require("./config/sequelize");

// Connect to the database
connectDB();

// Get the app
const app = require("./app");

let server = app.listen(process.env.PORT, process.env.HOST_NAME, () => {
    console.log(
        `Start listenting at http://${process.env.HOST_NAME}:${process.env.PORT}`
    );
});

// Handle unhandled promise rejection
process.on("unhandledRejection", function (err) {
    console.log(err.message);
    // close the server
    server.close();
    // Shut down the app
    process.exit(1); // 0 success, 1 unhandled exception
});

process.on("uncaughtException", function (err) {
    console.log(err.message); // this will not crash the app
});
