import express from 'express';
import { 
    createBootcamp, 
    updateBootcamp, 
    deleteBootcamp, 
    getBootcamps, 
    getBootcamp,
    getBootcampsInRadius 
} from '../controllers/bootcamps.js';

// Import other router
import coursesRoutes from './courses.js';

const router = express.Router();

// Bound to courses routes
router.use('/:bootcampId/courses', coursesRoutes);

router.route('/radius/:zipcode/:distance', ).get(getBootcampsInRadius);
router.route('/').get(getBootcamps).post(createBootcamp);
router.route('/:id').get(getBootcamp).put(updateBootcamp).delete(deleteBootcamp);

export default router;

