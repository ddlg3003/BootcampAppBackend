import express from 'express';
import { 
    getCourses,
    getCourse,
    createCourse,
    updateCourse,
    deleteCourse
} from '../controllers/courses.js';

// mergeParams will reserve the params from the parent router pass to this router
const router = express.Router({ mergeParams: true });

router.route('/').get(getCourses).post(createCourse);
router.route('/:id').get(getCourse).put(updateCourse).delete(deleteCourse);

export default router;

