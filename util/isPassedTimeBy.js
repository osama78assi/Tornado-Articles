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

    let wantedPassedTime = null;
    let passed = null;

    if (/^\d+\s*(m|M)(inutes?)?$/.test(duration)) {
        wantedPassedTime = parseInt(duration);
        passed = parseInt((futureDate - pastDate) / 1000 / 60);
    } else if (/^\d+\s*(h|H)(ours?)?$/.test(duration)) {
        wantedPassedTime = parseInt(duration);
        passed = parseInt((futureDate - pastDate) / 1000 / 60 / 60);
    } else if (/^\d+\s*(d|D)(ays?)?$/.test(duration)) {
        wantedPassedTime = parseInt(duration);
        passed = parseInt((futureDate - pastDate) / 1000 / 60 / 60 / 24);
    } else if (/^\d+\s*(w|W)(eeks?)?$/.test(duration)) {
        wantedPassedTime = parseInt(duration);
        passed = parseInt((futureDate - pastDate) / 1000 / 60 / 60 / 24 / 7);
    } else if (/^\d+\s*(m|M)(onths?)?$/.test(duration)) {
        wantedPassedTime = parseInt(duration);
        passed = parseInt((futureDate - pastDate) / 1000 / 60 / 60 / 24 / 30);
    } else if (/^\d+\s*(y|Y(ears?)?)$/.test(duration)) {
        wantedPassedTime = parseInt(duration);
        passed = parseInt(
            (futureDate - pastDate) / 1000 / 60 / 60 / 24 / 30 / 12
        ); // May have a few error boundray
    }

    if (passed === null && wantedPassedTime === null) {
        throw new Error("Passed duration doesn't matched any pattern.");
    }

    // If only it's equal or larger. Those will be null if the passed duration isn't correct
    if (passed >= wantedPassedTime) return true;
    return false;
}
