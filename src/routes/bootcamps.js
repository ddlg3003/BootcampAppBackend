import express from 'express';
import { 
    createBootcamp, 
    updateBootcamp, 
    deleteBootcamp, 
    getBootcamps, 
    getBootcamp,
    getBootcampsInRadius 
} from '../controllers/bootcamps.js';

const router = express.Router();

router.route('/radius/:zipcode/:distance', ).get(getBootcampsInRadius);
router.route('/').get(getBootcamps).post(createBootcamp);
router.route('/:id').get(getBootcamp).put(updateBootcamp).delete(deleteBootcamp);

export default router;

