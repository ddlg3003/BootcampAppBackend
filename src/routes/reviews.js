import express from 'express';
import { createReview, deleteReview, getReview, getReviews, updateReview } from '../controllers/reviews.js';
import advancedResult from '../middleware/advancedResult.js';
import Review from '../models/Review.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

router.route('/').get(advancedResult(Review), getReviews).post(protect, authorize('user', 'admin'), createReview);

router.route('/:id')
    .get(getReview)
    .put(protect, authorize('user', 'admin'), updateReview)
    .delete(protect, authorize('user', 'admin'), deleteReview);

export default router;