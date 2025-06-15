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
exports.UserController = void 0;
const UserRepository_1 = require("../../repositories/UserRepository");
const Database_1 = require("../../config/Database");
const User_1 = require("../../models/User");
const EmailService_1 = __importDefault(require("../../services/emails/EmailService"));
const Role_1 = require("../../models/Role");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
class UserController {
    static register(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { username, firstName, lastName, email, phoneNumber, password, confirmPassword } = req.body;
                console.log("Registering user with data in controller:", req.body);
                // === Validation Checks ===
                if (!username || username.length < 3 || username.length > 50) {
                    res
                        .status(400)
                        .json({
                        success: false,
                        message: "Username must be between 3 and 50 characters",
                    });
                    return;
                }
                if (!firstName || firstName.length < 1 || firstName.length > 50) {
                    res
                        .status(400)
                        .json({
                        success: false,
                        message: "First name must be between 1 and 50 characters",
                    });
                    return;
                }
                if (!lastName || lastName.length < 1 || lastName.length > 50) {
                    res
                        .status(400)
                        .json({
                        success: false,
                        message: "Last name must be between 1 and 50 characters",
                    });
                    return;
                }
                if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    res
                        .status(400)
                        .json({
                        success: false,
                        message: "Email must be a valid email address",
                    });
                    return;
                }
                if (phoneNumber && !/^\+?[1-9]\d{1,14}$/.test(phoneNumber)) {
                    res
                        .status(400)
                        .json({
                        success: false,
                        message: "Phone number must be a valid phone number",
                    });
                    return;
                }
                // === Password Validation but be optional ===
                if (password && password.length < 6) {
                    res
                        .status(400)
                        .json({
                        success: false,
                        message: "Password must be at least 6 characters long",
                    });
                    return;
                }
                if (password && password !== confirmPassword) {
                    res
                        .status(400)
                        .json({
                        success: false,
                        message: "Passwords do not match",
                    });
                    return;
                }
                //password should be hashed before saving to the database,and regex validation
                const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/;
                if (password && !passwordRegex.test(password)) {
                    res
                        .status(400)
                        .json({
                        success: false,
                        message: "Password must be at least 6 characters long and contain at least one uppercase letter, one lowercase letter, and one number",
                    });
                    return;
                }
                //hashing password it with salt by bcryptjs
                const hashedPassword = password ? yield bcryptjs_1.default.hash(password, 10) : undefined;
                // === Check for Existing User ===
                const existingUser = yield UserRepository_1.UserRepository.findExistingUser(email, username);
                if (existingUser) {
                    res
                        .status(400)
                        .json({ success: false, message: "User already exists" });
                    return;
                }
                // === Assign Default Role ===
                const roleRepository = Database_1.AppDataSource.getRepository(Role_1.Role);
                const guestRole = yield roleRepository.findOne({
                    where: { roleName: "GUEST" },
                });
                if (!guestRole) {
                    res
                        .status(500)
                        .json({
                        success: false,
                        message: "Default GUEST role not found. Please initialize roles.",
                    });
                    return;
                }
                const user = UserRepository_1.UserRepository.createUser({
                    username: username,
                    firstName: firstName,
                    lastName: lastName,
                    email: email,
                    phoneNumber: phoneNumber,
                    //password is optional, if not provided
                    password: hashedPassword, // Use the hashed password
                    // Set a default password or generate one dynamically
                    role: {
                        RoleID: guestRole.roleId,
                        RoleName: guestRole.roleName,
                        Permissions: guestRole.permissions || [],
                    }, // Map Role to RoleInterface
                });
                const result = yield UserRepository_1.UserRepository.saveUser(user);
                if (!result.user) {
                    res
                        .status(400)
                        .json({
                        success: false,
                        message: result.message || "Failed to save user",
                    });
                    return;
                }
                const savedUser = result.user;
                // === Send Default Password Email ===
                try {
                    const emailSent = yield EmailService_1.default.sendDefaultPassword(email, savedUser.lastName, savedUser.firstName, savedUser.username, req);
                    if (!emailSent) {
                        console.warn(`Failed to send email to ${email}, but user was created successfully`);
                        // Continue with registration despite email failure
                    }
                }
                catch (emailError) {
                    console.error("Error sending welcome email:", emailError);
                    // Continue with registration despite email failure
                }
                res.status(201).json({
                    success: true,
                    message: "User registered successfully. If email is configured correctly, a default password was sent.",
                    user: {
                        id: savedUser.userId,
                        username: savedUser.username,
                        email: savedUser.email,
                        firstName: savedUser.firstName,
                        lastName: savedUser.lastName,
                        phoneNumber: savedUser.phoneNumber,
                        Role: {
                            RoleID: guestRole.roleId,
                            RoleName: guestRole.roleName,
                            Permissions: guestRole.permissions || [],
                        }, // Map Role to RoleInterface
                    },
                });
            }
            catch (error) {
                console.error("Error in register:", error);
                res
                    .status(500)
                    .json({ success: false, message: "Internal server error" });
            }
        });
    }
    static getProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            res.status(200).json({ success: true, message: "User profile retrieved" });
        });
    }
    static updateProfile(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            res
                .status(200)
                .json({ success: true, message: "Profile updated successfully" });
        });
    }
    static getAllUsers(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const users = yield UserRepository_1.UserRepository.getAllUsers();
                if (!users || users.length === 0) {
                    res.status(404).json({ success: false, message: "No users found" });
                    return;
                }
                const formattedUsers = users.map((user) => {
                    var _a;
                    return ({
                        userId: user === null || user === void 0 ? void 0 : user.userId,
                        username: user === null || user === void 0 ? void 0 : user.username,
                        firstName: user === null || user === void 0 ? void 0 : user.firstName,
                        lastName: user === null || user === void 0 ? void 0 : user.lastName,
                        email: user === null || user === void 0 ? void 0 : user.email,
                        phoneNumber: user === null || user === void 0 ? void 0 : user.phoneNumber,
                        Role: (user === null || user === void 0 ? void 0 : user.role)
                            ? {
                                RoleID: user.role.roleId,
                                RoleName: user.role.roleName,
                                Permissions: user.role.permissions || [],
                            }
                            : null,
                        organizations: ((_a = user === null || user === void 0 ? void 0 : user.organizations) === null || _a === void 0 ? void 0 : _a.map((organization) => ({
                            OrganizationID: organization.organizationId,
                            OrganizationName: organization.organizationName,
                            Description: organization.description || "",
                            ContactEmail: organization.contactEmail,
                            ContactPhone: organization.contactPhone || "",
                            Address: organization.address || "",
                            OrganizationType: organization.organizationType || "",
                        }))) || [],
                    });
                });
                res.status(200).json({ success: true, users: formattedUsers });
            }
            catch (error) {
                console.error("Error in getAllUsers:", error);
                res
                    .status(500)
                    .json({ success: false, message: "Internal server error" });
            }
        });
    }
    static getUserById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                const user = yield UserRepository_1.UserRepository.getUserById(req.params.id);
                if (!user) {
                    res.status(404).json({ success: false, message: "User not found" });
                    return;
                }
                const formattedUser = {
                    userId: user.userId,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    Role: user.role
                        ? {
                            RoleID: user.role.roleId,
                            RoleName: user.role.roleName,
                            Permissions: user.role.permissions || [],
                        }
                        : null,
                    organizations: ((_a = user === null || user === void 0 ? void 0 : user.organizations) === null || _a === void 0 ? void 0 : _a.map((organization) => ({
                        OrganizationID: organization.organizationId,
                        OrganizationName: organization.organizationName,
                        Description: organization.description || "",
                        ContactEmail: organization.contactEmail,
                        ContactPhone: organization.contactPhone || "",
                        Address: organization.address || "",
                        OrganizationType: organization.organizationType || "",
                    }))) || [],
                    //get registration data from user which looks like this
                    /*
                    */
                    registrations: ((_b = user.registrations) === null || _b === void 0 ? void 0 : _b.map((registration) => ({
                        registrationIds: {
                            registrationId: registration.registrationId,
                            registrationDate: registration.registrationDate,
                            paymentStatus: registration.paymentStatus,
                            attended: registration.attended,
                        },
                        eventId: {
                            eventId: registration.event.eventId,
                            eventTitle: registration.event.eventTitle,
                            description: registration.event.description,
                            eventCategory: registration.event.eventCategory,
                            eventType: registration.event.eventType,
                        },
                        // Handle both array and single object cases for ticketType
                        ticketType: Array.isArray(registration.ticketTypes)
                            ? registration.ticketTypes.map((ticket) => ({
                                ticketTypeId: ticket.ticketTypeId,
                                ticketTypeName: ticket.ticketName,
                                price: ticket.price,
                                description: ticket.description,
                            }))
                            : registration.ticketTypes && typeof registration.ticketTypes === 'object'
                                ? [{
                                        ticketTypeId: registration.ticketTypes.ticketTypeId,
                                        ticketTypeName: registration.ticketTypes.ticketName,
                                        price: registration.ticketTypes.price,
                                        description: registration.ticketTypes.description,
                                    }]
                                : [],
                        eventName: {
                            eventId: registration.event.eventId,
                            eventTitle: registration.event.eventTitle,
                            description: registration.event.description,
                            eventCategory: registration.event.eventCategory,
                            eventType: registration.event.eventType,
                        },
                        venueName: {
                            venueId: registration.venue.venueId,
                            venueName: registration.venue.venueName,
                            capacity: registration.venue.capacity,
                            location: registration.venue.location,
                            managerId: registration.venue.managerId,
                            isAvailable: registration.venue.isAvailable,
                            isBooked: registration.venue.isBooked,
                        },
                        noOfTickets: registration.noOfTickets,
                        qrcode: registration.qrCode,
                        registrationDate: registration.registrationDate,
                        paymentStatus: registration.paymentStatus,
                        attended: registration.attended,
                    }))) || [],
                };
                res.status(200).json({ success: true, user: formattedUser });
            }
            catch (error) {
                console.error("Error in getUserById:", error);
                res
                    .status(500)
                    .json({ success: false, message: "Internal server error" });
            }
        });
    }
    static updateUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = req.params.id;
                const userRepository = Database_1.AppDataSource.getRepository(User_1.User);
                const user = yield userRepository.findOne({
                    where: { userId },
                    relations: ["role", "organizations"], // Include related entities
                });
                if (!user) {
                    res.status(404).json({ success: false, message: "User not found" });
                    return;
                }
                const { username, firstName, lastName, email, phoneNumber } = req.body;
                // Update user fields if they exist in the request
                if (username)
                    user.username = username;
                if (firstName)
                    user.firstName = firstName;
                if (lastName)
                    user.lastName = lastName;
                if (email)
                    user.email = email;
                if (phoneNumber)
                    user.phoneNumber = phoneNumber;
                const updatedUser = yield userRepository.save(user);
                res.status(200).json({
                    success: true,
                    message: "User updated successfully",
                    user: {
                        userId: updatedUser.userId,
                        username: updatedUser.username,
                        firstName: updatedUser.firstName,
                        lastName: updatedUser.lastName,
                        email: updatedUser.email,
                        phoneNumber: updatedUser.phoneNumber,
                        Role: updatedUser.role
                            ? {
                                RoleID: updatedUser.role.roleId,
                                RoleName: updatedUser.role.roleName,
                                Permissions: updatedUser.role.permissions || [],
                            }
                            : null,
                        organizations: ((_a = updatedUser.organizations) === null || _a === void 0 ? void 0 : _a.map((organization) => ({
                            OrganizationID: organization.organizationId,
                            OrganizationName: organization.organizationName,
                            Description: organization.description || "",
                            ContactEmail: organization.contactEmail,
                            ContactPhone: organization.contactPhone || "",
                            Address: organization.address || "",
                            OrganizationType: organization.organizationType || "",
                        }))) || [],
                    },
                });
            }
            catch (error) {
                console.error("Error in updateUser:", error);
                res.status(500).json({ success: false, message: "Internal server error" });
            }
        });
    }
    static deleteUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({ success: false, message: "User ID is required" });
                return;
            }
            try {
                const result = yield UserRepository_1.UserRepository.deleteUser(id);
                if (result.success) {
                    res.status(200).json({ success: true, message: result.message });
                }
                else {
                    res.status(404).json({ success: false, message: result.message });
                }
            }
            catch (error) {
                console.error("Error in deleteUser:", error);
                res
                    .status(500)
                    .json({ success: false, message: "Internal server error" });
            }
        });
    }
    static updateDefaultUserRole(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { userId, roleId } = req.body;
                // Validate input
                if (!userId || !roleId) {
                    res.status(400).json({ message: "User ID and Role ID are required" });
                    return;
                }
                // Call the repository function to assign the new role
                const result = yield UserRepository_1.UserRepository.assignUserRole(userId, roleId);
                // Handle the response from the repository
                if (result.message === "User role updated successfully") {
                    res.status(200).json({ message: result.message, data: result });
                }
                else if (result.message === "User not found" ||
                    result.message === "Role not found" ||
                    result.message === "User is not currently assigned the GUEST role") {
                    res.status(400).json({ message: result.message });
                }
                else {
                    res.status(500).json({ message: "Failed to assign user role" });
                }
            }
            catch (error) {
                console.error("Error in updateUserRole:", error);
                res.status(500).json({ message: "Internal server error" });
            }
        });
    }
    static updateAssignedUserRole(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e;
            try {
                // Get userId from URL parameters
                const { userId } = req.params;
                // Get roleId from request body
                const { roleId } = req.body;
                if (!userId) {
                    res.status(400).json({
                        success: false,
                        message: 'userId is required in the URL parameters',
                    });
                    return;
                }
                if (!roleId) {
                    res.status(400).json({
                        success: false,
                        message: 'roleId is required in the request body',
                    });
                    return;
                }
                // Call the repository method
                const result = yield UserRepository_1.UserRepository.updateUserRole(userId, roleId);
                if (result.success) {
                    res.status(200).json({
                        success: true,
                        message: result.message,
                        user: {
                            userId: (_a = result.user) === null || _a === void 0 ? void 0 : _a.userId,
                            username: (_b = result.user) === null || _b === void 0 ? void 0 : _b.username,
                            email: (_c = result.user) === null || _c === void 0 ? void 0 : _c.email,
                            role: {
                                roleId: (_d = result.newRole) === null || _d === void 0 ? void 0 : _d.roleId,
                                roleName: (_e = result.newRole) === null || _e === void 0 ? void 0 : _e.roleName
                            }
                        }
                    });
                }
                else {
                    res.status(400).json({
                        success: false,
                        message: result.message,
                    });
                }
            }
            catch (error) {
                console.error('Error in updateUserRole controller:', error);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error occurred while updating user role',
                });
            }
        });
    }
}
exports.UserController = UserController;
