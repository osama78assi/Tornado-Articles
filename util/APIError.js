/**
 * @typedef {Array<[string, string]>} AdditionalInfo
 */

import { any, array, string, tuple } from "zod/v4";

// The operation error is error that not related to syntax errors. Like missing values to create article
class APIError extends Error {
    /**
     * Global API error type
     * @param {string} message
     * @param {number} statusCode
     * @param {string} code
     * @param {AdditionalInfo|null} additionalData
     */
    constructor(message, statusCode, code, additionalData = null) {
        super(message);
        this.statusCode = statusCode;
        this.success = false;
        this.code = code;
        this.additionalData = {};

        // This is very usefull when you want to send more info using error handler middleware
        if (additionalData !== null) {
            // Define the shape of array items [key, value]
            const stringPair = tuple([string(), any()]);
            // The values
            const arrayOfPairs = array(stringPair);

            additionalData = arrayOfPairs.parse(additionalData);

            for (let pair of additionalData) {
                this.additionalData[pair[0]] = pair[1];
            }
        }
    }
}

export default APIError;
