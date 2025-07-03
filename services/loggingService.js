import EventEmitter from "events";
import { appendFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

class LoggingService extends EventEmitter {}

const loggingService = new LoggingService();

const __dirname = dirname(fileURLToPath(import.meta.url));

// Listening to logging some info about generating access tokens
loggingService.addListener(
    "refresh-tokens-log",
    function ({ userId, ip, requestedAt, isFirstTime = false }) {
        appendFile(
            join(__dirname, "../logs/access_token_requests.log"),
            `${
                isFirstTime ? "(Normal)" : "(Threat !)"
            } IP ${ip} got access token request with not exists JTI. For User with id ${userId} at ${requestedAt}. ${
                !isFirstTime ? "(Blocked)" : ""
            }\n`
        );
    }
);

// To measure the time that consumed by a route handler
loggingService.addListener(
    "resource-time-usage",
    function ({ resourceName, timeMs }) {
        appendFile(
            join(__dirname, "../logs/resources_usage.log"),
            `${new Date()}\n${resourceName} handler took about ${timeMs}ms to complete\n----------------\n`
        );
    }
);

// To measure a time taken by any function
loggingService.addListener(
    "function-time-usage",
    function ({ header, timeMs }) {
        appendFile(
            join(__dirname, "../logs/functions_usage.log"),
            `${new Date()}\n${header}: Took ${timeMs}ms to complete\n\n`
        );
    }
);

// For logging some queries time consuming
loggingService.addListener("query-time-usage", function ({ sql, timeMs }) {
    appendFile(
        join(__dirname, "../logs/sql_usage.log"),
        `${new Date()}\nSQL:\n${sql}\n\nTOOK: ${timeMs}ms\n\n---------------\n`
    );
});

loggingService.addListener("unexpected-rejection", function ({ error }) {
    appendFile(
        join(__dirname, "../logs/unexpected_rejection.log"),
        `${new Date()}\nError:\n${error}\n\n---------------\n\n`
    );
});

export default loggingService;
