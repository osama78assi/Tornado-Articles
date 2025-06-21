// The operation error is error that not related to syntax errors. Like missing values to create article
class APIError extends Error {
    /**
     * Global API error type
     * @param {string} message 
     * @param {number} statusCode 
     * @param {string} code 
     */
    constructor(message, statusCode, code) {
        super(message);
        this.statusCode = statusCode;
        this.success = false;
        this.code = code;
    }
}

export default APIError;
