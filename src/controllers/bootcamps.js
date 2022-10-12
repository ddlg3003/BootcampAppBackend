import path from 'path';
import Bootcamp from '../models/Bootcamp.js';
import ErrorResponse from '../utils/errorResponse.js';
import geocoder from '../utils/geocoder.js';
import asyncHandler from '../middleware/async.js';

// @desc    Get all bootcamps  
// @route   [GET] /api/v1/bootcamps
// @access  Public
export const getBootcamps = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

// @desc    Get single bootcamp  
// @route   [GET] /api/v1/bootcamps/:id
// @access  Public
export const getBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id).populate('courses', 'title tuition week');

    if(!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: bootcamp,
    })
});

// @desc    Create bootcamp  
// @route   [POST] /api/v1/bootcamps
// @access  Private
export const createBootcamp = asyncHandler(async (req, res, next) => {
    req.body.user = req.user._id;

    // Check that publisher can only create one bootcamp
    const publishedBootcamp = await Bootcamp.findOne({ user: req.user._id });

    if(publishedBootcamp && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User with role ${req.user.role} cannot publish more than one bootcamp`), 400);
    }

    const bootcamp = await Bootcamp.create(req.body);

    res.status(201).json({
        success: true,
        data: bootcamp,
    });
});

// @desc    Update bootcamp  
// @route   [PUT] /api/v1/bootcamps/:id
// @access  Private
export const updateBootcamp = asyncHandler(async (req, res, next) => {
    let bootcamp = await Bootcamp.findById(req.params.id);

    console.log(req.user);

    if(!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    }

    // Check if user is bootcamp owner (Note: the _id of user object and bootcamp user are
    // objectId so we need to convert em to a string to compare)
    if(bootcamp.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user._id} is unauthorized to update this bootcamp`, 401));
    }

    bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true, // Check all validation in collection's fields (match, enum, required)
    });

    res.status(200).json({
        success: true,
        data: bootcamp,
    })
});

// @desc    Delete bootcamp  
// @route   [DELETE] /api/v1/bootcamps/:id
// @access  Private
export const deleteBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if(!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    }

    // Check if user is bootcamp owner
    if(bootcamp.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User ${req.user._id} is unauthorized to delete this bootcamp`, 401));
    }

    bootcamp.remove();

    res.status(200).json({
        success: true,
        data: {},
    })
});

// @desc    Get bootcamps within a radius  
// @route   [GET] /api/v1/bootcamps/radius/:zipcode/:distance
// @access  Private
export const getBootcampsInRadius = asyncHandler(async (req, res, next) => {
    const { zipcode, distance } = req.params;

    const loc = await geocoder.geocode(zipcode);
    console.log(loc);
    const lat = loc[0].latitude;
    const long = loc[0].longitude;

    // Calculate radius using radians
    // Earth radius = 3,963 mi / 6,378 km
    const radius = distance / 3963;

    const bootcamps = await Bootcamp.find({ 
        location: { $geoWithin: { $centerSphere: [ [long, lat], radius ] } } 
    });

    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps,
    });
});

// @desc    Upload photo for bootcamp 
// @route   [PUT] /api/v1/bootcamps/:id/photo
// @access  Private
export const bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if(!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    }

    // Check if user is bootcamp owner
    if(bootcamp.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return next(new ErrorResponse(
            `User ${req.user._id} is unauthorized to upload image for this bootcamp`, 
            401
        ));
    }

    if(!req.files) {
        return next(new ErrorResponse(`Please upload a file`, 400));
    }

    const file = req.files.file;

    // Check if the file is photo with startsWith string method (image/jpeg)
    if(!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse('Please upload an image', 400)); 
    }

    // Check filesize
    if(file.size > process.env.MAX_FILE_SIZE) {
        return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_SIZE}`, 400)); 
    }

    // Create custom file name
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

    // Upload file name to out path
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
        if(err) {
            console.error(err);
            return next(new ErrorResponse(`Problem with file upload`, 500));
        }

        await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });

        // To access the photo from browser, go to /uploads/:imgName
        res.status(200).json({
            success: true,
            data: file.name,
        });
    });
});