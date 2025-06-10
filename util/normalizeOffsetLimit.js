import { MIN_RESULTS, MAX_RESULTS } from "../config/settings";

function normalizeOffsetLimit(offset, limit) {
    return {
        offset: offset < 0 ? 0 : offset,
        limit:
            limit > MAX_RESULTS ? MAX_RESULTS : limit < 0 ? MIN_RESULTS : limit,
    };
}

module.exports = normalizeOffsetLimit;
