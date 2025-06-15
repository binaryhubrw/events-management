// src/middlewares/AuthMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../config/Database"; // Adjust path to your data-source
import { User } from "../models/User"; // Adjust path to your User entity
import { Role } from "../models/Role"; // Adjust path to your Role entity (assuming you have one)

const SECRET_KEY = process.env.JWT_SECRET || "your_jwt_secret"; // Use env variable in production

// Define the structure of the decoded JWT payload
interface JwtPayload {
    userId: string;
    email: string;
    username: string;
    organizations: any[]; // Array of organization objects, as sent in login
    organizationId: string;
    roles?: string | string[]; // Adjust this type based on what `user.roles` is in your User entity when signing the token.
                              // If it's the role ID (UUID), then `string`. If an array of IDs, then `string[]`.
                              // Your log `Role(s): f92a8b37-fbcb-428e-a5b1-fc16064989ef` suggests a single string UUID.
}

// Extend the Request object to include a 'user' property with detailed info
export interface AuthenticatedRequest extends Request {
    user?: {
        userId: string;
        email: string;
        username: string;
        organizations: any[]; // Array of organization objects
        organizationId: string;
        roles: { roleName: string; permissions: string[] }[]; // Array of detailed role objects
    };
}

export const verifyJWT = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const authHeader = req.headers.authorization;
    // Prefer header token, fallback to cookie if needed (though header is standard for APIs)
    const token = authHeader?.split(" ")[1]; // Removed `|| req.cookies?.authToken` as header is primary

    if (!token) {
        console.log("Access denied: No token provided."); // Add logging for debugging
        res.status(401).json({
            success: false,
            message: "Access denied. No token provided.",
        });
        return;
    }

    try {
        // 1. Verify the JWT token payload
        // Cast to our defined JwtPayload interface
        const decoded = jwt.verify(token, SECRET_KEY) as JwtPayload;

        console.log("AuthMiddleware: Decoded JWT Payload:", decoded); // Log decoded payload

        // 2. Fetch the user from the database along with their role and permissions
        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({
            where: { userId: decoded.userId },
            // Assuming User has a one-to-one or many-to-one relation named 'role' to the Role entity.
            // And Role entity has a property like 'permissions' which is an array of strings.
            relations: ["role", "organizations"], // Load the 'role' relation and 'organizations' again if needed for current data
                                                // Although organizations are already in the JWT payload from login.
                                                // Re-fetching user.organizations here ensures fresh data, but increases DB calls.
                                                // If organizations in token are sufficient, remove it from relations.
        });

        if (!user) {
            console.warn(`Invalid token: User ${decoded.userId} not found in database.`);
            res.status(401).json({
                success: false,
                message: "Invalid token: User not found in database.",
            });
            return;
        }

        // 3. Extract role names and permissions from the *fetched* user object
        let userRoles: { roleName: string; permissions: string[] }[] = [];

        // Assuming a single role relationship (one-to-one or many-to-one)
        if (user.role) { // Check if user.role exists
            userRoles.push({
                roleName: user.role.roleName,
                permissions: user.role.permissions || [] // Ensure permissions is an array
            });
        }
        // If a user can have MULTIPLE roles via a many-to-many 'userRoles' table, uncomment this:
        /*
        // Make sure your User entity has a property like `userRoles: UserRole[]`
        // and UserRole entity relates to Role: `role: Role`
        if (user.userRoles && Array.isArray(user.userRoles)) {
            userRoles = user.userRoles.map(userRole => ({
                roleName: userRole.role.roleName,
                permissions: userRole.role.permissions || []
            }));
        }
        */

        // 4. Populate req.user with combined data
        // Use data from JWT for userId, email, username, organizations, organizationId
        // Use data from database for roles (with full details)
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            username: decoded.username,
            organizations: decoded.organizations, // Take from JWT payload as it's already there
            organizationId: decoded.organizationId, // Take from JWT payload
            roles: userRoles, // This now contains the detailed role name and permissions from DB
        };

        console.log("AuthMiddleware: req.user populated with:", req.user); // Log final req.user for debugging

        next(); // Proceed to the next middleware or route handler

    } catch (err) {
        console.error("AuthMiddleware - JWT verification error:", err); // Log the actual error for debugging
        if (err instanceof jwt.TokenExpiredError) {
            res.status(401).json({ success: false, message: "Token expired. Please log in again." });
        } else if (err instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ success: false, message: "Invalid token. Please log in again." });
        } else {
            res.status(500).json({ success: false, message: "Authentication failed due to server error." });
        }
    }
};

// No changes needed for isAdmin if it uses req.user.userId and req.user.roles correctly.
// Since verifyJWT now populates req.user.roles correctly, isAdmin should work fine.
// (You'd likely adjust isAdmin to check permissions instead of just roleName string matching for more granularity)

/* Example DTO, just keeping it here for context as it's part of the original paste
class CancelTicketsDto {
    @IsArray({ message: 'idsToCancel must be an array' })
    @ArrayNotEmpty({ message: 'idsToCancel array cannot be empty' })
    @IsUUID('4', { each: true, message: 'Each ID in idsToCancel must be a valid UUID' })
    idsToCancel!: string[];
}
*/