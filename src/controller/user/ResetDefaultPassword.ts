// src/controller/auth/ResetPasswordController.ts
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { AppDataSource } from "../../config/Database";
import { User } from "../../models/User";
import { UserController } from "./Registration";
import PasswordService from '../../services/emails/EmailService';



const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";

export default class ResetPasswordController extends UserController {
  static async resetDefaultPassword(req: Request, res: Response): Promise<void> {
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
      const decoded = jwt.verify(token, SECRET_KEY) as {
        userId: string;
        email: string;
        username: string;
        needsPasswordReset?: boolean;
      };

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
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
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
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
      await userRepository.save(user);

      // Generate new token without needsPasswordReset flag
      const newToken = jwt.sign(
        {
          userId: user.userId,
          email: user.email,
          username: user.username
        },
        SECRET_KEY,
        { expiresIn: "24h" }
      );

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

    } catch (error: any) {
      console.error("❌ Password reset error:", error);

      let errorMessage = "Password reset failed";
      if (error instanceof jwt.TokenExpiredError) {
        errorMessage = "Reset token has expired";
      } else if (error instanceof jwt.JsonWebTokenError) {
        errorMessage = "Invalid reset token";
      }

      res.status(400).json({
        success: false,
        message: errorMessage
      });
    }
  }

  static async forgotPasswordLink(req: Request, res: Response): Promise<void> {
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
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
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
      const resetToken = jwt.sign(
        {
          userId: user.userId,
          email: user.email,
          username: user.username,
          purpose: 'password_reset'
        },
        SECRET_KEY,
        { expiresIn: '1h' }
      );
  
      // 5. Create reset link
      const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5000';
      const resetLink = `${baseUrl}/pages/reset-password?token=${resetToken}`;
  
      // 6. Send email
    await PasswordService.sendPasswordResetEmail(user.email, resetLink);
  
      // 7. Return success response
      res.status(200).json({
        success: true,
        message: 'Password reset instructions have been sent to your email',
      });
  
    } catch (error) {
      console.error('❌ Forgot password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process password reset request',
      });
    }
  }
   
  //function of forgetting or changing password by using user name or email as identifier

  static async forgotPasswordLinkByUsernameOrEmail(req: Request, res: Response): Promise<void> {
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
      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({
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
      user.password = await bcrypt.hash(password, 10);
      await userRepository.save(user);
  
      // ✅ Send success email
      await PasswordService.sendSuccessPasswordForgetEmail(user.email, user.username,user.password);
  
      res.status(200).json({
        success: true,
        message: "Password updated successfully. Please check your email.",
      });
  
    } catch (error) {
      console.error("❌ Error in forgotPasswordLinkByUsernameOrEmail:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
  


 





 
  }

















