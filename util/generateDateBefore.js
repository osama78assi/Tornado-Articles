import parseStrPeriod from "./parseStrPeriod.js";

/**
 * @typedef Options
 * @property {Date} date the date you want start at. Default is current time
 * @property {boolean} firstMoment Wether to set the date at first moment in the result date. Default false
 */

/**
 * Generate a date before given period
 * @param {string} strPeriod The period you want
 * @param {Options}
 * @returns {Date} The date before the given period
 * @example
 * const dateBeforeMonth = generateDateBefore('1 month', new Date('6/21/2025')); // new Date('5/21/2025')
 */
export default function generateDateBefore(
    strPeriod,
    { date = new Date(), firstMoment = false }
) {
    const { keyword, period } = parseStrPeriod(strPeriod);

    // To be able to decrement
    let time = 0;

    switch (keyword) {
        case "minute":
            time = parseInt(period) * 1000 * 60;
            break;
        case "hour":
            time = parseInt(period) * 1000 * 60 * 60;
            break;
        case "day":
            time = parseInt(period) * 1000 * 60 * 60 * 24;
            break;
        case "week":
            time = parseInt(period) * 1000 * 60 * 60 * 24 * 7;
            break;
        case "month":
            // Same reason for consistency here
            time = parseInt(period) * 1000 * 60 * 60 * 24 * 30;
            break;
        case "year":
            time = parseInt(period) * 1000 * 60 * 60 * 24 * 365;
            break;
    }

    let res = new Date(date.getTime() - time);

    if(firstMoment) {
        res.setHours(0 ,0, 0, 0) // Set it to the very first moment
    }

    return res;
}
