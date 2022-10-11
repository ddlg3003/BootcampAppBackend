import express from 'express';
import { 
    createBootcamp, 
    updateBootcamp, 
    deleteBootcamp, 
    getBootcamps, 
    getBootcamp,
    getBootcampsInRadius, 
    bootcampPhotoUpload
} from '../controllers/bootcamps.js';

import { protect, authorize } from '../middleware/auth.js';
import advancedResult from '../middleware/advancedResult.js';
import Bootcamp from '../models/Bootcamp.js';

// Import other router
import coursesRoutes from './courses.js';

const router = express.Router();

// Bound to courses routes
router.use('/:bootcampId/courses', coursesRoutes);

// Bootcamp routes
router.route('/radius/:zipcode/:distance', ).get(getBootcampsInRadius);

router.route('/')
    .get(advancedResult(Bootcamp, { path: 'courses', select: 'title tuition description' }), getBootcamps)
    .post(protect, authorize('publisher', 'admin'), createBootcamp);

router.route('/:id')
    .get(getBootcamp)
    .put(protect, authorize('publisher', 'admin'), updateBootcamp)
    .delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

router.route('/:id/photo').put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload);

export default router;

