// The operation error is error that not related to syntax errors. Like missing values to create article
class OperationError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.status = "error";
    }
}

module.exports = OperationError;
