class WrongPeriod extends Error {
    constructor(message) {
        this.message = message;
    }
}

/**
 * @typedef {Object} ParsedTime
 * @property {number} number - The period value (1, 2, ...).
 * @property {'millisecond' | 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year'} keyword - The period type like month. day...
 */

/**
 *
 * @param {string} strPeriod The wanted period string to be parsed
 * @returns {ParsedTime}
 */
export default function parseStrPeriod(strPeriod) {
    if (strPeriod.startsWith("-"))
        throw new Error("The period must have positive number");

    strPeriod = strPeriod.toLowerCase();

    if (/^\d+\s*(ms|(milliseconds?))$/.test(strPeriod))
        return {
            period: parseInt(strPeriod), // This will take the number from the beginning of the string
            keyword: "millisecond",
    };

    if (/^\d+\s*s(econds?)?$/.test(strPeriod))
        return {
            period: parseInt(strPeriod),
            keyword: "second",
    };

    if (/^\d+\s*m(inutes?)?$/.test(strPeriod))
        return {
            period: parseInt(strPeriod),
            keyword: "minute",
        };

    if (/^\d+\s*h(ours?)?$/.test(strPeriod))
        return {
            period: parseInt(strPeriod),
            keyword: "hour",
        };

    if (/^\d+\s*d(ays?)?$/.test(strPeriod))
        return {
            period: parseInt(strPeriod),
            keyword: "day",
        };

    if (/^\d+\s*w(eeks?)?$/.test(strPeriod))
        return {
            period: parseInt(strPeriod),
            keyword: "week",
        };

    if (/^\d+\s*mo(nths?)?$/.test(strPeriod))
        return {
            period: parseInt(strPeriod),
            keyword: "month",
        };

    if (/^\d+\s*y(ears?)?$/.test(strPeriod))
        return {
            period: parseInt(strPeriod),
            keyword: "year",
        };

    // If the code reach this depth that means the period couldn't parsed successfully
    throw new WrongPeriod("Passed period hasn't matched any pattern.");
}

export { WrongPeriod };
