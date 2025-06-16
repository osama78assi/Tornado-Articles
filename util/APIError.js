// The operation error is error that not related to syntax errors. Like missing values to create article
class APIError extends Error {
    constructor(message, statusCode, code) {
        super(message);
        this.statusCode = statusCode;
        this.success = false;
        this.code = code;
    }
}

export default APIError;
