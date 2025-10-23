import { Router } from 'express';
import { loginUser } from '../controllers/loginController.js';
import { registerUser } from '../controllers/registerController.js';
import { getSecret } from '../controllers/secretController.js';
import { getAllUsers } from '../controllers/getAllUsersController.js';

const router = Router();

//users
router.post('/login', loginUser);
router.post('/register', registerUser);
router.get('/secret', getSecret);
router.get('/users', getAllUsers);

export default router;
