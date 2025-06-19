import loggingService from "../services/loggingService.js";

/**
 * In short it take your handler and return a function to call it But in addition to that it measure the time taken to achieve it.
 * 
 * It will log it to the file `resources_usage.log`. And it doesn't tell you if the handler throws an error or not
 * @param {function(import('express').Request, import('express').Response, import('express').NextFunction): any} handler 
 * @param {string} resourceName 
 * @param {number} precision 
 * @returns {function(import('express').Request, import('express').Response, import('express').NextFunction): any}
 */
function measureHandlerTime(handler, resourceName, precision = 2) {
    
    // This will be called by you or by express
    return async function (req, res, next) {
        // Start high-resolution clock
        let startTime = process.hrtime();

        await handler(req, res, next);

        // Get the milliseconds from nano seconds
        let time = (startTime[1] / 1000000).toFixed(precision);

        // Fire the event
        loggingService.emit("resource-time-usage", {
            resourceName,
            timeMs: time,
        });

        // Reset the time
        startTime = process.hrtime();
    };
}

export default measureHandlerTime;
