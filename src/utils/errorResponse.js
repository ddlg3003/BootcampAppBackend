class ErrorResponse extends Error {
    constructor(message, statusCode) {
        // @override message from Error
        super(message);
        this.statusCode = statusCode;
    }
}

export default ErrorResponse;