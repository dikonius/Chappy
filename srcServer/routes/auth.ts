import { Router } from 'express';
import { loginUser } from '../controllers/loginController.js';
import { registerUser } from '../controllers/registerController.js';
import { getSecret } from '../controllers/secretController.js';
import { getAllUsers } from '../controllers/getAllUsersController.js';
import { authMiddleware } from '../middleware/authMiddleware.js'; 

const router = Router();

// Public auth
router.post('/login', loginUser);
router.post('/register', registerUser);
router.get('/user', getAllUsers);

// Protected
router.get('/secret', authMiddleware, getSecret);


export default router;