import express from 'express';
import { forgotPassword, getMe, login, logout, register, resetPassword, updatePassword, updateProfile } from '../controllers/auth.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Auth routes
router.route('/register').post(register);
router.route('/login').post(login);
router.route('/logout').get(logout);
router.route('/me').get(protect, getMe);
router.route('/updateprofile').put(protect, updateProfile);
router.route('/updatepassword').put(protect, updatePassword);
router.route('/forgotpassword').post(forgotPassword);
router.route('/resetpassword/:resetToken').put(resetPassword);

export default router;