import { Router } from 'express';

import { signup, login, logout, forgotPassword, resetPassword, updatePassword } from '../controllers/authController.js';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.get('/reset-password', resetPassword);
router.post('/update-password', updatePassword);

export default router;