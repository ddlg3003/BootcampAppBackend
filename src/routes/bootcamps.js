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
    .post(createBootcamp);

router.route('/:id').get(getBootcamp).put(updateBootcamp).delete(deleteBootcamp);
router.route('/:id/photo').put(bootcampPhotoUpload);

export default router;

