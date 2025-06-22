import loggingService from "../services/loggingService.js";

class MeasureFunctionTypeError extends Error {
    constructor(message, options) {
        super(message, options);
    }
}

class MeasureFucntionArgsError extends Error {
    constructor(message, options) {
        super(message, options);
    }
}

export default async function measureFuncTime(
    header,
    func,
    funcArgs,
    precision = 0
) {
    if (typeof func !== "function")
        throw new MeasureFunctionTypeError(
            "The passed func argument must be a function"
        );

    if (!Array.isArray(funcArgs))
        throw new MeasureFucntionArgsError(
            "The function args must be an array to be passed to the function you want to meausre its time"
        );

    // Start high-resolution clock
    let startTime = process.hrtime();

    // This maybe unnecessary await but there is no problem with it
    const data = await func(...funcArgs);

    // Get the milliseconds from nano seconds
    let time = (startTime[1] / 1000000).toFixed(precision);

    // Fire the event
    loggingService.emit("function-time-usage", {
        header,
        timeMs: time,
    });

    // Reset the time
    startTime = process.hrtime();
    return data;
}
