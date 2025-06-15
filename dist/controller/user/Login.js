"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoginController = void 0;
const Database_1 = require("../../config/Database");
const User_1 = require("../../models/User");
const bcrypt = __importStar(require("bcryptjs"));
const Registration_1 = require("./Registration");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const EmailService_1 = __importDefault(require("../../services/emails/EmailService"));
const SECRET_KEY = process.env.JWT_SECRET || 'sdbgvkghdfcnmfxdxdfggj';
const COOKIE_EXPIRATION = 24 * 60 * 60 * 1000; // 24 hours
class LoginController extends Registration_1.UserController {
    static loginWithDefaultPassward(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            if (!Database_1.AppDataSource.isInitialized) {
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
            const userRepository = Database_1.AppDataSource.getRepository(User_1.User);
            try {
                const user = yield userRepository.findOne({
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
                if (!((_a = req.session) === null || _a === void 0 ? void 0 : _a.defaultPassword) ||
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
                    EmailService_1.default.invalidateDefaultPassword(req, user.email);
                }
                else if (user.password) {
                    isMatch = yield bcrypt.compare(password, user.password);
                }
                if (!isMatch) {
                    res.status(401).json({
                        success: false,
                        message: "Incorrect password. Please try again.",
                    });
                    return;
                }
                // Generate JWT token
                const token = jsonwebtoken_1.default.sign({
                    userId: user.userId,
                    email: user.email,
                    username: user.username,
                    needsPasswordReset: isSessionPasswordLogin,
                }, SECRET_KEY, { expiresIn: "24h" });
                res.cookie("authToken", token, {
                    httpOnly: true,
                    maxAge: COOKIE_EXPIRATION,
                    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
                    secure: process.env.NODE_ENV === "production",
                });
                const { password: _ } = user, userData = __rest(user, ["password"]);
                res.status(200).json({
                    success: true,
                    message: isSessionPasswordLogin
                        ? "Login successful! Please create a new password."
                        : "Login successful!",
                    user: Object.assign(Object.assign({}, userData), { needsPasswordReset: isSessionPasswordLogin }),
                    token,
                });
            }
            catch (error) {
                console.error("Login error:", error);
                res.status(500).json({
                    success: false,
                    message: "Something went wrong while logging in.",
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        });
    }
    static login(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { identifier, password } = req.body;
            // Validate request
            if (!identifier || !password) {
                res.status(400).json({
                    success: false,
                    message: "Please provide both username/email and password."
                });
                return;
            }
            const userRepository = Database_1.AppDataSource.getRepository(User_1.User);
            try {
                // Find user by email or username, including organizations
                const user = yield userRepository.findOne({
                    where: [{ email: identifier }, { username: identifier }],
                    relations: ["organizations"] // Eager load organizations
                });
                if (!user) {
                    res.status(404).json({
                        success: false,
                        message: "No account found with that email or username."
                    });
                    return;
                }
                // Check password
                let isMatch = false;
                if (!password) {
                    isMatch = true; // Default password logic
                }
                else if (user.password) {
                    isMatch = yield bcrypt.compare(password, user.password);
                }
                if (!isMatch) {
                    res.status(401).json({
                        success: false,
                        message: "Incorrect password. Please try again."
                    });
                    return;
                }
                // Ensure organizations exist before generating token
                if (!user.organizations || user.organizations.length === 0) {
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
                console.log("Organizations found:", JSON.stringify(organizations, null, 2));
                // Extract first organization ID
                const firstOrganizationId = organizations[0].organizationId;
                console.log("First Organization ID:", firstOrganizationId);
                // Generate JWT token with full organization details AND first organization ID
                const token = jsonwebtoken_1.default.sign({
                    userId: user.userId,
                    email: user.email,
                    username: user.username,
                    organizations, // Store full organization details
                    organizationId: firstOrganizationId, // Store first organization ID separately
                    roles: user.roles,
                }, SECRET_KEY, { expiresIn: "24h" });
                // Send the token as response
                res.status(200).json({
                    success: true,
                    user: {
                        userId: user.userId,
                        email: user.email,
                        username: user.username,
                        roles: user.roles,
                        organizations: organizations.map(organizationId => organizationId), // Send full organization details
                    },
                    message: "Login successful!",
                    token
                });
            }
            catch (error) {
                console.error("Login error:", error);
                res.status(500).json({
                    success: false,
                    message: "Something went wrong while logging in.",
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
            }
        });
    }
}
exports.LoginController = LoginController;
