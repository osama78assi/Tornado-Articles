import parseStrPeriod from "./parseStrPeriod.js";

/**
 * Generate a date after given period
 * @param {string} strPeriod The period you want
 * @returns {Date} The date after the given period
 * @example
 * const dateAfterMonth = generateDateAfter('1 month', new Date('6/21/2025')); //
 */
export default function generateDateAfter(strPeriod, date = new Date()) {
    const { keyword, period } = parseStrPeriod(strPeriod);

    // To be able to increamnt
    let time = date.getTime();

    switch (keyword) {
        case "minute":
            time += parseInt(period) * 1000 * 60;
            break;
        case "hour":
            time += parseInt(period) * 1000 * 60 * 60;
            break;
        case "day":
            time += parseInt(period) * 1000 * 60 * 60 * 24;
            break;
        case "week":
            time += parseInt(period) * 1000 * 60 * 60 * 24 * 7;
            break;
        case "month":
            // Same reason for consistency here
            time += parseInt(period) * 1000 * 60 * 60 * 24 * 30;
            break;
        case "year":
            time += parseInt(period) * 1000 * 60 * 60 * 24 * 365;
            break;
    }

    return new Date(time);
}
