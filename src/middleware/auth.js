import jwt from 'jsonwebtoken';
import asyncHandler from './async.js';
import ErrorResponse from '../utils/errorResponse.js';
import User from '../models/User.js';

// Protect routes
export const protect = asyncHandler(async (req, res, next) => {
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    } 
    // else if(req.cookies.token) {}

    if(!token) return next(new ErrorResponse('Not authorize to access this route', 401));

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = await User.findById(decoded.id);

        next();
    }
    catch(error) {
        if(!token) return next(new ErrorResponse('Not authorize to access this route', 401));
    }
});

export const authorize = (...roles) => (req, res, next) => {
    if(!roles.includes(req.user.role)) {
        return next(new ErrorResponse(`User role ${req.user.role} is not unauthorized to access this route`, 403));
    }

    next();
}