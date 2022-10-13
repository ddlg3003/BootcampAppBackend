import Review from '../models/Review.js';
import Bootcamp from '../models/Bootcamp.js';
import asyncHandler from '../middleware/async.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get all reviews  
// @route   [GET] /api/v1/reviews
// @route   [GET] /api/v1/bootcamps/:bootcampsId/reviews
// @access  Public
export const getReviews = asyncHandler(async (req, res, next) => {
    if(req.params.bootcampId) {
        const reviews = await Review.find({ bootcamp: req.params.bootcampId });

        return res.status(200).json({
            success: true,
            total: reviews.length,
            data: reviews,
        });
    }
    res.status(200).json(res.advancedResults);
});

// @desc    Get single review 
// @route   [GET] /api/v1/reviews/:id
// @access  Public
export const getReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id);

    if(!review) {
        return next(new ErrorResponse(`No review found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: review,
    });
});

// @desc    Create review 
// @route   [POST] /api/v1/bootcamps/:bootcampId/reviews/:id
// @access  Private
export const createReview = asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId; 
    req.body.user = req.user._id;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if(!bootcamp) {
        return next(new ErrorResponse(`No Bootcamp found with id of ${req.params.bootcampId}`, 404));
 
    }

    const review = await Review.create(req.body);

    res.status(201).json({
        success: true,
        data: review,
    });
});

// @desc    Update review 
// @route   [PUT] /api/v1/reviews/:id
// @access  Private
export const updateReview = asyncHandler(async (req, res, next) => {
    const { user, bootcamp, ...data } = req.body;

    let review = await Review.findById(req.params.id);

    if(!review) {
        return next(new ErrorResponse(`No review found with id of ${req.params.id}`, 404));
    }

    if(req.user._id.toString() !== review.user.toString() && req.user.role !== 'admin') {
        return next(new ErrorResponse('Not authorized', 401));
    }

    review = await Review.findByIdAndUpdate(req.params.id, data, {
        new: true, 
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        data: review,
    });
});

// @desc    Update review 
// @route   [DELETE] /api/v1/reviews/:id
// @access  Private
export const deleteReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id);

    if(!review) {
        return next(new ErrorResponse(`No review found with id of ${req.params.id}`, 404));
    }

    if(req.user._id.toString() !== review.user.toString() && req.user.role !== 'admin') {
        return next(new ErrorResponse('Not authorized', 401));
    }

    review.remove();

    res.status(200).json({
        success: true,
        data: {},
    });
});