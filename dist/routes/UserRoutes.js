"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = require("express");
const Registration_1 = require("../controller/user/Registration");
const Login_1 = require("../controller/user/Login");
const ResetDefaultPassword_1 = __importDefault(require("../controller/user/ResetDefaultPassword"));
const AuthMiddleware_1 = require("../middlewares/AuthMiddleware");
const router = (0, express_1.Router)();
// Public routes (no auth needed)
router.post('/register', Registration_1.UserController.register);
router.post('/login', Login_1.LoginController.login);
router.post('/default-login-password', Login_1.LoginController.loginWithDefaultPassward);
router.post('/reset-password', AuthMiddleware_1.verifyJWT, ResetDefaultPassword_1.default.resetDefaultPassword);
router.post('/request-forget-password-link', ResetDefaultPassword_1.default.forgotPasswordLink);
router.post('/forget-password', ResetDefaultPassword_1.default.forgotPasswordLinkByUsernameOrEmail);
// line to protect everything that comes after
router.use(AuthMiddleware_1.verifyJWT);
// Protected routes
router.post('/assign-role', Registration_1.UserController.updateDefaultUserRole);
router.post('/:userId/role', Registration_1.UserController.updateAssignedUserRole);
router.get('/profile', Registration_1.UserController.getProfile);
router.put('/profile', Registration_1.UserController.updateProfile);
router.get('/', Registration_1.UserController.getAllUsers);
router.get('/:id', Registration_1.UserController.getUserById);
router.put('/:id', Registration_1.UserController.updateUser);
router.delete('/:id', Registration_1.UserController.deleteUser);
exports.userRoutes = router;
