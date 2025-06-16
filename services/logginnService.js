import EventEmitter from "events";
import { appendFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

class LoggingService extends EventEmitter {}

const loggingService = new LoggingService();

// Listening to logging some info about generating access tokens
loggingService.addListener(
    "refresh-tokens-log",
    function ({ userId, ip, requestedAt, isFirstTime = false }) {
        const __dirname = dirname(fileURLToPath(import.meta.url));

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

// To test how much time consumed by a route
loggingService.addListener(
    "resource-time-usage",
    function ({ resourceName, timeMs }) {
        const __dirname = dirname(fileURLToPath(import.meta.url));

        appendFile(
            join(__dirname, "../logs/resources_usage.log"),
            `${resourceName} handler took about ${timeMs}ms to complete\n`
        );
    }
);

export default loggingService;
