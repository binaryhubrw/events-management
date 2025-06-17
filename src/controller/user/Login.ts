// src/controller/auth/LoginController.ts
import { Request, Response } from 'express';
import { AppDataSource } from '../../config/Database';
import { User } from '../../models/User';
import * as bcrypt from "bcryptjs";
import { UserController } from './Registration';
import jwt from 'jsonwebtoken';
import PasswordService from '../../services/emails/EmailService';

const SECRET_KEY = process.env.JWT_SECRET || 'sdbgvkghdfcnmfxdxdfggj';
const COOKIE_EXPIRATION = 24 * 60 * 60 * 1000; // 24 hours

export class LoginController extends UserController {
  static async loginWithDefaultPassward(req: Request, res: Response): Promise<void> {
    if (!AppDataSource.isInitialized) {
      res.status(500).json({ success: false, message: "Database not initialized" });
      return;
    }

    const { identifier, password } = req.body;

    if (!identifier || !password) {
      res.status(400).json({
        success: false,
        message: "Please enter both email/username and password.",
      });
      return;
    }

    const userRepository = AppDataSource.getRepository(User);

    try {
      const user = await userRepository.findOne({
        where: [{ email: identifier }, { username: identifier }],
        relations: ["role", "organizations"],
      });

      if (!user) {
        res.status(404).json({
          success: false,
          message: "No account found with that email or username.",
        });
        return;
      }

      // Verify session data matches
      if (!req.session?.defaultPassword || 
          !(req.session.defaultEmail === user.email || req.session.username === user.username)) {
        res.status(401).json({
          success: false,
          message: "Session data doesn't match user account.",
        });
        return;
      }

      // Password verification
      let isMatch = false;
      let isSessionPasswordLogin = false;

      if (req.session.defaultPassword === password) {
        isMatch = true;
        isSessionPasswordLogin = true;
        PasswordService.invalidateDefaultPassword(req, user.email);
      } else if (user.password) {
        isMatch = await bcrypt.compare(password, user.password);
      }

      if (!isMatch) {
        res.status(401).json({
          success: false,
          message: "Incorrect password. Please try again.",
        });
        return;
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          userId: user.userId,
          email: user.email,
          username: user.username,
          needsPasswordReset: isSessionPasswordLogin,
        },
        SECRET_KEY,
        { expiresIn: "24h" }
      );

      res.cookie("authToken", token, {
        httpOnly: true,
        maxAge: COOKIE_EXPIRATION,
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        secure: process.env.NODE_ENV === "production",
      });

      const { password: _, ...userData } = user;

      res.status(200).json({
        success: true,
        message: isSessionPasswordLogin 
          ? "Login successful! Please create a new password." 
          : "Login successful!",
        user: { ...userData, needsPasswordReset: isSessionPasswordLogin },
        token,
      });

    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({
        success: false,
        message: "Something went wrong while logging in.",
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

static async login(req: Request, res: Response): Promise<void> {
        const { identifier, password } = req.body;

        // Validate request
        if (!identifier || !password) {
            res.status(400).json({
                success: false,
                message: "Please provide both username/email and password."
            });
            return;
        }

        const userRepository = AppDataSource.getRepository(User);

        try {
            // Find user by email or username, including organizations
            const user = await userRepository.findOne({
                where: [{ email: identifier }, { username: identifier }],
                relations: ["role", 'organizations'] // Eager load organizations
            });

            if (!user) {
                console.log(`[Login Attempt] Identifier: ${identifier} - No account found.`); // Log attempt for non-existent user
                res.status(404).json({
                    success: false,
                    message: "No account found with that email or username."
                });
                return;
            }

            // Check password
            let isMatch = false;
            // The original code had `if (!password) { isMatch = true; }` which implies a default password scenario.
            // If this is intended for initial user setup without a password, be very careful with security.
            // For a standard login, `password` should always be present and validated against the hashed password.
            // I'm assuming for a regular login flow, `password` will always be provided and hashed.
            if (user.password) {
                isMatch = await bcrypt.compare(password, user.password);
            } else {
                // Handle case where user has no password set (e.g., created via external service)
                // You might want to prevent login or force a password reset here.
                // For simplicity, let's assume `isMatch` remains false if no password to compare against.
                isMatch = false;
            }


            if (!isMatch) {
                console.log(`[Login Attempt] User ID: ${user.userId} (${identifier}) - Incorrect password.`); // Log failed password attempt
                res.status(401).json({
                    success: false,
                    message: "Incorrect password. Please try again."
                });
                return;
            }

            // Ensure organizations exist before generating token
            if (!user.organizations || user.organizations.length === 0) {
                console.log(`[Login Attempt] User ID: ${user.userId} (${identifier}) - Not associated with any organization.`);
                console.log(user) // Log for missing organization
                res.status(401).json({
                    success: false,
                    message: "Unauthorized: User is not associated with any organization."
                });
                return;
            }

            // Extract full organization details
            const organizations = user.organizations.map(org => ({
                organizationId: org.organizationId,
                organizationName: org.organizationName,
                description: org.description,
                contactEmail: org.contactEmail,
                contactPhone: org.contactPhone,
                address: org.address,
                organizationType: org.organizationType
            }));

            // Console log the organizations found (for debugging)
            console.log("Organizations found for user:", JSON.stringify(organizations, null, 2));

            // Extract first organization ID
            const firstOrganizationId = organizations[0].organizationId;
            console.log("First Organization ID for user:", firstOrganizationId);

            // Determine the primary role for logging. If `user.roles` is an array of strings,
            // you might pick the first one or prioritize based on your application logic.
            const userRoles = user.role.roleId ? user.role.roleId : 'N/A';

            // --- Console log role name and logged-in user ID ---
            console.log(`[Login Success] User ID: ${user.userId}, Role(s): ${userRoles}`);


            // Generate JWT token with full organization details AND first organization ID
            const token = jwt.sign(
                {
                    userId: user.userId,
                    email: user.email,
                    username: user.username,
                    organizations, // Store full organization details
                    organizationId: firstOrganizationId, // Store first organization ID separately
                    roles:{
                      roleId:user.role
                    },
                },
                SECRET_KEY,
                { expiresIn: "24h" }
            );

            // Send the token as response
            res.status(200).json({
                success: true,
                user: {
                    userId: user.userId,
                    email: user.email,
                    username: user.username,
                    roles: user.roles,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    phoneNumber: user.phoneNumber,
                    gender: user.gender,
                    bio: user.bio,
                    profilePictureUrl: user.profilePictureUrl,
                    emailNotifiacationsEnabled: user.emailNotifiacationsEnabled,
                    dateOfBirth: user.dateOfBirth,
                    addressLine: user.addressLine,
                    city: user.city,
                    stateProvince: user.stateProvince,
                    country: user.country,
                     
          
          
                    // You're mapping `organizationId` to `organizationId` which is redundant here.
                    // It should just be `organizations: organizations` if you want the full array of objects.
                    organizations: organizations, // Send full organization details
                },
                message: "Login successful!",
                token
            });

        } catch (error) {
            console.error("Login error:", error);
            res.status(500).json({
                success: false,
                message: "Something went wrong while logging in.",
                error: error instanceof Error ? error.message : 'Unknown error',
            });
        }
    }

}