import Bootcamp from '../models/Bootcamp.js';
import ErrorResponse from '../utils/errorResponse.js';
import geocoder from '../utils/geocoder.js';
import asyncHandler from '../middleware/async.js';

// @desc    Get all bootcamps  
// @route   [GET] /api/v1/bootcamps
// @access  Public
export const getBootcamps = asyncHandler(async (req, res, next) => {
    let query;

    // Copy req.query to not to change the query
    const reqQuery = { ...req.query };
    
    // Exclude fields when filtering with find() cuz they're not a field in db
    const excludeFields = ['select', 'sort', 'page', 'limit'];
    
    excludeFields.forEach(field => delete reqQuery[field]);

    // Create query string 
    let queryStr = JSON.stringify(reqQuery);

    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);
    
    // Find method to find the document with the specified condition
    query = Bootcamp.find(JSON.parse(queryStr)).populate('courses', 'title tuition week');

    // Select fields: mongoose needs a string of select fields seperated by spaces
    if(req.query.select) {
        const fields = req.query.select.split(',').join(' ');

        // Select method of mongoose to get a certain fields of documents. E.g. select('name age') 
        query = query.select(fields);
    }

    // Sort fields
    if(req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');

        // Sort fields ascending when not prefix with -
        query = query.sort(sortBy);
    } else {
        // Sorted by create date descending by default
        query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    // Count all documents with query (object query)
    const total = await Bootcamp.countDocuments(query);
    
    query = query.skip(startIndex).limit(limit);
    
    const bootcamps = await query;

    // Pagination result
    const pagination = {};

    if(endIndex < total && Math.ceil(total / limit) >= page) {
        pagination.next = {
            page: page + 1,
            limit,
        }
    }

    if(startIndex > 0 && Math.ceil(total / limit) >= page) {
        pagination.prev = {
            page: page - 1,
            limit,
        }
    }

    res.status(200).json({
        success: true,
        total,
        pagination,
        data: bootcamps,
    })
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
        data: bootcamp
    })
});

// @desc    Create bootcamp  
// @route   [POST] /api/v1/bootcamps
// @access  Private
export const createBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.create(req.body);

    res.status(201).json({
        success: true,
        data: bootcamp
    });
});

// @desc    Update bootcamp  
// @route   [PUT] /api/v1/bootcamps/:id
// @access  Private
export const updateBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true // Check all validation in collection's fields (match, enum, required)
    });

    if(!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: bootcamp
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

    bootcamp.remove();

    res.status(200).json({
        success: true,
        data: {}
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
        data: bootcamps
    });
});