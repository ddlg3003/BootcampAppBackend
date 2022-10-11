import express from 'express';
import { 
    getCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse
} from '../controllers/courses.js';

import { protect, authorize } from '../middleware/auth.js';
import Course from '../models/Course.js';
import advancedResult from '../middleware/advancedResult.js';

// mergeParams will reserve the params from the parent router pass to this router
const router = express.Router({ mergeParams: true });

router.route('/')
    .get(advancedResult(Course, { path: 'bootcamp', select: 'name description' }), getCourses)
    .post(protect, authorize('publisher', 'admin'), createCourse);

router.route('/:id')
    .get(getCourse)
    .put(protect, authorize('publisher', 'admin'), updateCourse)
    .delete(protect, authorize('publisher', 'admin'), deleteCourse);

export default router;

