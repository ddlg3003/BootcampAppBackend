import Course from '../models/Course.js';
import Bootcamp from '../models/Bootcamp.js';
import asyncHandler from '../middleware/async.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get all courses  
// @route   [GET] /api/v1/courses
// @route   [GET] /api/v1/bootcamps/:bootcampsId/courses
// @access  Public
export const getCourses = asyncHandler(async (req, res, next) => {
    if(req.params.bootcampId) {
        const courses = await Course.find({ bootcamp: req.params.bootcampId });

        return res.status(200).json({
            success: true,
            total: courses.length,
            data: courses
        });
    }
    res.status(200).json(res.advancedResults);
});

// @desc    Get all courses  
// @route   [GET] /api/v1/courses/:id
// @access  Public
export const getCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id).populate('bootcamp', 'name description');

    if(!course) return next(new ErrorResponse(`No course with id of ${req.params.id}`, 404));
    
    res.status(200).json({
        success: true,
        data: course,
    })
});


// @desc    Create a new course 
// @route   [POST] /api/v1/bootcamps/:bootcampId/courses
// @access  Private
export const createCourse = asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId;

    req.body.user = req.user._id;

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if(!bootcamp) {
        return next(new ErrorResponse(`No bootcamp with id of ${req.params.id}`, 404));
    }

    // Check if user is bootcamp owner
    if(bootcamp.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user._id} is unauthorized to add course to this bootcamp`, 401));
    }
    
    const course = await Course.create(req.body);
    
    res.status(200).json({
        success: true,
        data: course,
    })
});

// @desc    Update course 
// @route   [PUT] /api/v1/courses/:id
// @access  Private
export const updateCourse = asyncHandler(async (req, res, next) => {
    const { bootcamp, ...data } = req.body;

    let course = await Course.findById(req.params.id);    

    if(!course) {
        return next(new ErrorResponse(`No course with id of ${req.params.id}`, 404));
    }

    // Check if user is course owner
    if(course.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user._id} is unauthorized to update this course`, 401));
    }

    course = await Course.findByIdAndUpdate(req.params.id, data, {
        new: true,
        runValidators: true,
    });

    res.status(200).json({
        success: true,
        data: course,
    })
});

// @desc    Delete course 
// @route   [DELETE] /api/v1/courses/:id
// @access  Private
export const deleteCourse = asyncHandler(async (req, res, next) => {

    const course = await Course.findById(req.params.id);

    if(!course) {
        return next(new ErrorResponse(`No course with id of ${req.params.id}`, 404));
    }

    // Check if user is course owner
    if(course.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user._id} is unauthorized to delete this course`, 401));
    }

    await course.remove();

    res.status(200).json({
        success: true,
        data: {},
    })
});

