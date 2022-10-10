import Course from '../models/Course.js';
import Bootcamp from '../models/Bootcamp.js';
import asyncHandler from '../middleware/async.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Get all courses  
// @route   [GET] /api/v1/courses
// @route   [GET] /api/v1/bootcamps/:bootcampsId/courses
// @access  Public
export const getCourses = asyncHandler(async (req, res, next) => {
    let query;

    if(req.params.bootcampId) {
        query = Course.find({ bootcamp: req.params.bootcampId });
    } else {
        query = Course.find().populate('bootcamp', 'name description');
    }

    const courses = await query;
    
    res.status(200).json({
        success: true,
        count: courses.length,
        data: courses,
    })
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

    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    if(!bootcamp) return next(new ErrorResponse(`No bootcamp with id of ${req.params.id}`, 404));

    const course = await Course.create(req.body);
    
    res.status(200).json({
        success: true,
        data: course,
    })
});