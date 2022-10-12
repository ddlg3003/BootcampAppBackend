import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponse.js';
import asyncHandler from '../middleware/async.js';

// @desc    Get all users 
// @route   [GET] /api/v1/users
// @access  Private - Admin
export const getUsers = asyncHandler(async (req, res, next) => {
    res.status(200).json({ success: true, data: res.advancedResults });
});

// @desc    Get single user  
// @route   [GET] /api/v1/users/:id
// @access  Private - Admin
export const getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    if(!user) {
        return next(new ErrorResponse(`User not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: user,
    })
});

// @desc    Create user  
// @route   [POST] /api/v1/users
// @access  Private - Admin
export const createUser = asyncHandler(async (req, res, next) => {
    const user = await User.create(req.body);

    res.status(201).json({
        success: true,
        data: user,
    })
});

// @desc    Update user  
// @route   [PUT] /api/v1/users
// @access  Private - Admin
export const updateUser = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        success: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        data: user,
    })
});

// @desc    Delete user  
// @route   [DELETE] /api/v1/users
// @access  Private - Admin
export const deleteUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);
    
    if(req.params.id === req.user._id.toString() || user.role === 'admin') {
        return next(new ErrorResponse('You cannot delete youself and other admins :)', 400));
    }

    user.remove();

    res.status(200).json({
        success: true,
        data: {},
    })
});