import ErrorResponse from '../utils/errorResponse.js';

const errorHandler = (err, req, res, next) => {
    let error = { ...err };
    let message = '';
    
    error.message = err.message;
    
    // Logging
    console.log(err);

    // Mongoose bad ObjectId
    if(err.name === 'CastError') {
        message = `Resource not found with id of ${err.value}`;
        error = new ErrorResponse(message, 404);
    }

    // Mongoose duplicate key
    if(err.code === 11000) {
        message = 'Duplicate field value';
        error = new ErrorResponse(message, 400);
    }

    // Mongoose validation error
    if(err.name === 'ValidationError') {
        // Object.values return array of values for object we pass in
        message = Object.values(err.errors).map(val => val.message).join(', ');
        error = new ErrorResponse(message, 400);
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'server error',
    });
}

export default errorHandler;