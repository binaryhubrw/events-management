import { Router } from 'express';
import { UserController } from '../controller/user/Registration'; 
import { LoginController } from '../controller/user/Login'; 
import ResetPassword from '../controller/user/ResetDefaultPassword';
import { verifyJWT } from '../middlewares/AuthMiddleware';
const router = Router();

// Public routes (no auth needed)
router.post('/register', UserController.register);
router.post('/login', LoginController.login);
router.post('/default-login-password', LoginController.loginWithDefaultPassward);
router.post('/reset-password', verifyJWT, ResetPassword.resetDefaultPassword);
router.post('/request-forget-password-link', ResetPassword.forgotPasswordLink);
router.post('/forget-password', ResetPassword.forgotPasswordLinkByUsernameOrEmail);

// line to protect everything that comes after
router.use(verifyJWT);

// Protected routes
router.post('/assign-role', UserController.updateDefaultUserRole);
router.post('/:userId/role', UserController.updateAssignedUserRole);
router.get('/profile', UserController.getProfile);
router.put('/profile', UserController.updateProfile);
router.get('/', UserController.getAllUsers);
router.get('/:id', UserController.getUserById);
router.put('/:id', UserController.updateUser);
router.delete('/:id', UserController.deleteUser);


export const userRoutes = router;