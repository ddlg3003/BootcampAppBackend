import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/async.js';

// @desc    Register user 
// @route   [POST] /api/v1/auth/register
// @access  Public
export const register = asyncHandler(async (req, res, next) => {
    const { name, email, password, role } = req.body;

    const user = await User.create({name, email, password, role});

    sendTokenResponse(user, 200, res);
});

// @desc    Login user 
// @route   [POST] /api/v1/auth/login
// @access  Public
export const login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;

    // Validate email & password    
    if(!email || !password) {
        return next(new ErrorResponse('Please provide email and password', 400));
    }

    // Check user
    const user = await User.findOne({ email }).select('+password');

    if(!user) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    // Check match password
    const isMatch = await user.matchPassword(password);

    if(!isMatch) {
        return next(new ErrorResponse('Invalid credentials', 401));
    }

    sendTokenResponse(user, 200, res);
});

// Get token, create cookie
const sendTokenResponse = (user, statusCode, res) => {
    // Create token
    const token = user.getSignedJwt();

    // cookie options
    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    };

    res.status(statusCode).cookie('token', token, options).json({
        success: true,
        token
    });
}

// @desc    get current logged user 
// @route   [GET] /api/v1/auth/me
// @access  Private
export const getMe = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user._id);

    res.status(200).json({
        success: true,
        data: user
    });
});