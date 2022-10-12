import crypto from 'crypto';
import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/async.js';
import sendMail from '../utils/sendEmail.js';

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

// @desc    Forgot password
// @route   [POST] /api/v1/auth/forgotpassword
// @access  Public
export const forgotPassword = asyncHandler(async (req, res, next) => {
    const { email, redirectUrl } = req.body;

    if(!redirectUrl) {
        return next(new ErrorResponse('Please provide a redirect url to forward to reset password page', 400));
    }

    const user = await User.findOne({ email });

    if(!user) {
        return next(new ErrorResponse('There is no user with that email', 404));
    }

    // Get reset token
    const resetToken = user.getResetPasswordToken();
    
    console.log(resetToken);

    // save user after create reset token and reset expire
    await user.save({ validateBeforeSave: false });
    
    // Reset url
    const resetUrl = `${redirectUrl}/${resetToken}`;
    
    const message = `<div>Hello, you are receiving this email because you (or someone else) has requested 
    the reset of password. Go to this url for changing password: </div> ${resetUrl}`;

    // Call the send mail async function 
    try {
        await sendMail({
            email: user.email,
            subject: 'Password reset token',
            message
        });

        res.status(200).json({ success: true, data: 'Email sent' });
    }
    catch(error) {
        console.log(error);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return next(new ErrorResponse('Cannot sent mail', 500));
    }
});

// @desc    Reset password via link sent to email 
// @route   [PUT] /api/v1/auth/resetpassword/:resetToken
// @access  Public
export const resetPassword = asyncHandler(async (req, res, next) => {
    // Get hashed token 
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resetToken).digest('hex');

    console.log(req.params.resetToken);

    const user = await User.findOne({ resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } });

    if(!user) {
        return next(new ErrorResponse('Invalid token', 400));
    }

    // Set new password
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({ success: true, data: 'Password changed' });
});

// @desc    Update user detail
// @route   [PUT] /api/v1/auth/updateprofile
// @access  Private
export const updateProfile = asyncHandler(async (req, res, next) => {
    const { name, email } = req.body;
    
    const user = await User.findByIdAndUpdate(req.user._id, { name, email }, {
        runValidators: true,
        new: true,
    });

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc    Update password
// @route   [PUT] /api/v1/auth/updatepassword
// @access  Private
export const updatePassword = asyncHandler(async (req, res, next) => {    
    const user = await User.findById(req.user._id).select('+password');

    if(!(await user.matchPassword(req.body.currentPassword))) {
        return next(new ErrorResponse('Password is incorrect', 401))
    }

    user.password = req.body.newPassword;

    await user.save();

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