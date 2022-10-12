import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import advancedResult from '../middleware/advancedResult.js';

import { createUser, getUsers, getUser, updateUser, deleteUser } from '../controllers/user.js';
import User from '../models/User.js';

const router = express.Router();

router.use(protect); 
router.use(authorize('admin'));

router.route('/').get(advancedResult(User), getUsers).post(createUser);
router.route('/:id').get(getUser).put(updateUser).delete(deleteUser);

export default router;

