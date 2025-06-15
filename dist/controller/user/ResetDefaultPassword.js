"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const Database_1 = require("../../config/Database");
const User_1 = require("../../models/User");
const Registration_1 = require("./Registration");
const EmailService_1 = __importDefault(require("../../services/emails/EmailService"));
const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";
class ResetPasswordController extends Registration_1.UserController {
    static resetDefaultPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            // Extract password and confirmation from request body
            const { password, confirm_password } = req.body;
            // Extract token from Authorization header
            const authHeader = req.headers.authorization;
            if (!authHeader || !authHeader.startsWith('Bearer ')) {
                res.status(401).json({
                    success: false,
                    message: "Authentication token is required"
                });
                return;
            }
            const token = authHeader.split(' ')[1];
            if (!token || !password || !confirm_password) {
                res.status(400).json({
                    success: false,
                    message: "Token, password and confirmation are required"
                });
                return;
            }
            if (password !== confirm_password) {
                res.status(400).json({
                    success: false,
                    message: "Password and confirmation do not match"
                });
                return;
            }
            try {
                // Decode and verify token
                const decoded = jsonwebtoken_1.default.verify(token, SECRET_KEY);
                console.log("🔐 Decoded JWT:", decoded);
                // Check if token indicates need for password reset
                if (!decoded.needsPasswordReset) {
                    res.status(403).json({
                        success: false,
                        message: "This token is not authorized for password reset"
                    });
                    return;
                }
                // Find user from token data
                const userRepository = Database_1.AppDataSource.getRepository(User_1.User);
                const user = yield userRepository.findOne({
                    where: { userId: decoded.userId }
                });
                if (!user) {
                    res.status(404).json({
                        success: false,
                        message: "User not found"
                    });
                    return;
                }
                console.log("👤 Found User:", user.email);
                // Update password
                const hashedPassword = yield bcryptjs_1.default.hash(password, 10);
                user.password = hashedPassword;
                yield userRepository.save(user);
                // Generate new token without needsPasswordReset flag
                const newToken = jsonwebtoken_1.default.sign({
                    userId: user.userId,
                    email: user.email,
                    username: user.username
                }, SECRET_KEY, { expiresIn: "24h" });
                // Set new cookie
                res.cookie("authToken", newToken, {
                    httpOnly: true,
                    maxAge: 24 * 60 * 60 * 1000, // 24 hours
                    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
                    secure: process.env.NODE_ENV === "production",
                });
                // Return success response with new token
                res.status(200).json({
                    success: true,
                    message: "Password updated successfully",
                    token: newToken
                });
            }
            catch (error) {
                console.error("❌ Password reset error:", error);
                let errorMessage = "Password reset failed";
                if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                    errorMessage = "Reset token has expired";
                }
                else if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                    errorMessage = "Invalid reset token";
                }
                res.status(400).json({
                    success: false,
                    message: errorMessage
                });
            }
        });
    }
    static forgotPasswordLink(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email } = req.body;
            // 1. Validate email
            if (!email) {
                res.status(400).json({
                    success: false,
                    message: 'Email is required',
                });
                return;
            }
            try {
                // 2. Check if user exists with this email
                const userRepository = Database_1.AppDataSource.getRepository(User_1.User);
                const user = yield userRepository.findOne({
                    where: { email },
                });
                // 3. Always return success even if user not found (security best practice)
                if (!user) {
                    console.log(`Password reset requested for non-existent email: ${email}`);
                    res.status(200).json({
                        success: true,
                        message: 'If an account exists with this email, password reset instructions have been sent',
                    });
                    return;
                }
                // 4. Generate password reset token
                const resetToken = jsonwebtoken_1.default.sign({
                    userId: user.userId,
                    email: user.email,
                    username: user.username,
                    purpose: 'password_reset'
                }, SECRET_KEY, { expiresIn: '1h' });
                // 5. Create reset link
                const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5000';
                const resetLink = `${baseUrl}/pages/reset-password?token=${resetToken}`;
                // 6. Send email
                yield EmailService_1.default.sendPasswordResetEmail(user.email, resetLink);
                // 7. Return success response
                res.status(200).json({
                    success: true,
                    message: 'Password reset instructions have been sent to your email',
                });
            }
            catch (error) {
                console.error('❌ Forgot password error:', error);
                res.status(500).json({
                    success: false,
                    message: 'Failed to process password reset request',
                });
            }
        });
    }
    //function of forgetting or changing password by using user name or email as identifier
    static forgotPasswordLinkByUsernameOrEmail(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { identifier, password, confirmPassword } = req.body;
            if (!identifier || !password || !confirmPassword) {
                res.status(400).json({
                    success: false,
                    message: "Identifier, password, and confirm password are required.",
                });
                return;
            }
            if (password !== confirmPassword) {
                res.status(400).json({
                    success: false,
                    message: "Password and confirm password do not match.",
                });
                return;
            }
            try {
                const userRepository = Database_1.AppDataSource.getRepository(User_1.User);
                const user = yield userRepository.findOne({
                    where: [{ email: identifier }, { username: identifier }],
                });
                if (!user) {
                    res.status(404).json({
                        success: false,
                        message: "User not found",
                    });
                    return;
                }
                // 🔐 Hash new password and update it
                user.password = yield bcryptjs_1.default.hash(password, 10);
                yield userRepository.save(user);
                // ✅ Send success email
                yield EmailService_1.default.sendSuccessPasswordForgetEmail(user.email, user.username, user.password);
                res.status(200).json({
                    success: true,
                    message: "Password updated successfully. Please check your email.",
                });
            }
            catch (error) {
                console.error("❌ Error in forgotPasswordLinkByUsernameOrEmail:", error);
                res.status(500).json({
                    success: false,
                    message: "Internal server error",
                });
            }
        });
    }
}
exports.default = ResetPasswordController;
