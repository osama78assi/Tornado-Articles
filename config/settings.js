// Allow users pick how many rows he wants but really not more than 25
// It's good if we don't have CROS and someone tried to hungup our server by sending
// he wants 1000 rows. You can call it extra semi-security
const MAX_RESULTS = 25;

const MIN_RESULTS = 10;

module.exports = { MAX_RESULTS, MIN_RESULTS };
