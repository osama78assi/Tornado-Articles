import parseStrPeriod from "./parseStrPeriod.js";

/**
 * Check if the given future date is have a 'duration' difference between it and the past date
 * @param {Date} futureDate
 * @param {Date} pastDate
 * @param {string} duration This can me '1d' or '1D' same for month, hours and weeks
 * @returns {bool} wether it passed or not
 * @throws Error if the passed dates aren't date objects or the passed duration string doesn't match any pattern
 *
 * @example
 * const futureDate = new Date('7/17/2025');
 * const pastDate = new Date('6/17/2025');
 * isPassedTimeBy(futureDate, pastDate, '30d'); // true
 * isPassedTimeBy(futureDate, pastDate, '4 weeks'); // true
 * isPassedTimeBy(futureDate, pastDate, '30 hour'); // true
 * isPassedTimeBy(futureDate, pastDate, '1 Month'); // true
 * isPassedTimeBy(futureDate, pastDate, '1 year'); // false
 * isPassedTimeBy(futureDate, pastDate, '1 months'); // true
 */
export default function isPassedTimeBy(futureDate, pastDate, duration) {
    if (!futureDate instanceof Date && !pastDate instanceof Date) {
        throw new Error("Both `futureDate` and `pastDate` must be date object");
    }

    const { keyword, period } = parseStrPeriod(duration);
    let passed = null;

    switch (keyword) {
        case "millisecond":
            passed = parseInt(futureDate - pastDate);
            break;
        case "second":
            passed = parseInt((futureDate - pastDate) / 1000);
            break;
        case "minute":
            passed = parseInt((futureDate - pastDate) / 1000 / 60);
            break;
        case "hour":
            passed = parseInt((futureDate - pastDate) / 1000 / 60 / 60);
            break;
        case "day":
            passed = parseInt((futureDate - pastDate) / 1000 / 60 / 60 / 24);
            break;
        case "week":
            passed = parseInt(
                (futureDate - pastDate) / 1000 / 60 / 60 / 24 / 7
            );
            break;
        case "month":
            // Months and years are considered the normalized time like month 30 days. Year 365 just for consistency
            passed = parseInt(
                (futureDate - pastDate) / 1000 / 60 / 60 / 24 / 30
            );
            break;
        case "year":
            passed = parseInt(
                (futureDate - pastDate) / 1000 / 60 / 60 / 24 / 365
            );
            break;
    }

    // If only it's equal or larger. Those will be null if the passed duration isn't correct
    if (passed >= period) return true;
    return false;
}
