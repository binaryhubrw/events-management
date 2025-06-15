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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const Database_1 = require("../config/Database");
const User_1 = require("../models/User");
const Role_1 = require("../models/Role");
const typeorm_1 = require("typeorm");
class UserRepository {
    /**
     * Find existing user by email or username
     */
    static findExistingUser(email, username) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!Database_1.AppDataSource.isInitialized) {
                throw new Error("Database not initialized");
            }
            const userRepository = Database_1.AppDataSource.getRepository(User_1.User);
            try {
                return yield userRepository.findOne({
                    where: [{ email }, { username }],
                });
            }
            catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                throw new Error('Error finding existing user: ' + errorMessage);
            }
        });
    }
    /**
     * Create a user entity from request data
     */
    static createUser(data) {
        var _a, _b, _c, _d, _e;
        const user = new User_1.User();
        user.username = (_a = data.username) !== null && _a !== void 0 ? _a : '';
        user.firstName = (_b = data.firstName) !== null && _b !== void 0 ? _b : '';
        user.lastName = (_c = data.lastName) !== null && _c !== void 0 ? _c : '';
        user.email = (_d = data.email) !== null && _d !== void 0 ? _d : '';
        user.phoneNumber = (_e = data.phoneNumber) !== null && _e !== void 0 ? _e : undefined;
        return user;
    }
    /**
     */
    static saveUser(user) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!Database_1.AppDataSource.isInitialized) {
                throw new Error("Database not initialized");
            }
            const userRepository = Database_1.AppDataSource.getRepository(User_1.User);
            const roleRepository = Database_1.AppDataSource.getRepository(Role_1.Role);
            try {
                // 1. Assign default role
                const guestRole = yield roleRepository.findOne({ where: { roleName: 'GUEST' } });
                if (!guestRole) {
                    console.warn('"GUEST" role not found. Please seed the roles first.');
                    return { message: 'System configuration error: Default role not found' };
                }
                // Assign the GUEST role to the user
                user.role = guestRole;
                // 2. Save the user
                const savedUser = yield userRepository.save(user);
                return {
                    message: 'User saved successfully with default role "GUEST"',
                    user: savedUser,
                };
            }
            catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                console.error('Error saving user:', errorMessage);
                return { message: 'Database error: ' + errorMessage };
            }
        });
    }
    static getAllUsers() {
        return __awaiter(this, void 0, void 0, function* () {
            const userRepository = Database_1.AppDataSource.getRepository(User_1.User);
            return yield userRepository.find({
                select: ["userId", "username", "firstName", "lastName", "email", "phoneNumber"],
                relations: ["role", "organizations"], // Correct the relation names      order: { username: "DESC" }, // Sort by username
            });
        });
    }
    static getUserById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const userRepository = Database_1.AppDataSource.getRepository(User_1.User);
            // Fetch the user with registrations and their primary relations
            const user = yield userRepository.findOne({
                where: { userId: id },
                select: ["userId", "username", "firstName", "lastName", "email", "phoneNumber"],
                relations: [
                    "role",
                    "organizations",
                    "registrations",
                    "registrations.event", // Ensure these are loaded if you want their details
                    "registrations.user", // The attendee user for THIS registration
                    "registrations.ticketType",
                    "registrations.venue"
                ],
            });
            if (!user) {
                return null;
            }
            // Now, collect all unique boughtForIds from all registrations
            const allBoughtForUserIds = [];
            if (user.registrations) {
                user.registrations.forEach(reg => {
                    if (reg.boughtForIds) {
                        reg.boughtForIds.forEach(boughtForId => {
                            if (!allBoughtForUserIds.includes(boughtForId)) {
                                allBoughtForUserIds.push(boughtForId);
                            }
                        });
                    }
                });
            }
            let boughtForUsersMap = new Map();
            if (allBoughtForUserIds.length > 0) {
                const boughtUsers = yield userRepository.find({
                    where: { userId: (0, typeorm_1.In)(allBoughtForUserIds) },
                    select: ["userId", "username", "firstName", "lastName", "email", "phoneNumber"], // Select relevant user details
                });
                boughtUsers.forEach(bUser => boughtForUsersMap.set(bUser.userId, bUser));
            }
            // Attach the fetched boughtForUsersMap to the user object (temporarily)
            // This is a common pattern to pass extra data to the controller without altering the entity.
            user._fetchedBoughtForUsersMap = boughtForUsersMap;
            return user;
        });
    }
    static deleteUser(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const userRepository = Database_1.AppDataSource.getRepository(User_1.User);
            try {
                const user = yield userRepository.findOne({ where: { userId: id } });
                if (!user) {
                    return { success: false, message: "User not found" };
                }
                yield userRepository.remove(user);
                return { success: true, message: "User deleted successfully" };
            }
            catch (error) {
                console.error("Error deleting user:", error);
                return { success: false, message: "Failed to delete user" };
            }
        });
    }
    static assignUserRole(userId, newRoleId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const userRepository = Database_1.AppDataSource.getRepository(User_1.User);
            const roleRepository = Database_1.AppDataSource.getRepository(Role_1.Role);
            try {
                // Fetch the user by their ID
                const user = yield userRepository.findOne({
                    where: { userId },
                    relations: ['role'], // Ensure the current role is fetched
                });
                if (!user) {
                    return { success: false, message: 'User not found' };
                }
                // Fetch the new role by its ID
                const newRole = yield roleRepository.findOne({
                    where: { roleId: newRoleId },
                });
                if (!newRole) {
                    return { success: false, message: 'Role not found' };
                }
                // Check if the user's current role is GUEST, null, or empty (case-insensitive)
                const currentRoleName = ((_b = (_a = user.role) === null || _a === void 0 ? void 0 : _a.roleName) === null || _b === void 0 ? void 0 : _b.toLowerCase()) || '';
                if (!user.role || currentRoleName === '' || currentRoleName === 'guest') {
                    // Assign the new role to the user
                    user.role = newRole;
                    // Save the updated user
                    yield userRepository.save(user);
                    return { success: true, message: 'User role updated successfully' };
                }
                else {
                    return { success: false, message: 'User is not currently assigned the GUEST role or has no role assigned' };
                }
            }
            catch (error) {
                console.error('Error assigning user role:', error);
                return { success: false, message: 'Failed to assign user role' };
            }
        });
    }
    // Repository method
    static updateUserRole(userId, newRoleId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const userRepository = Database_1.AppDataSource.getRepository(User_1.User);
            const roleRepository = Database_1.AppDataSource.getRepository(Role_1.Role);
            try {
                // Fetch the user by their ID
                const user = yield userRepository.findOne({
                    where: { userId },
                    relations: ['role'], // Ensure the current role is fetched
                });
                if (!user) {
                    return { success: false, message: 'User not found' };
                }
                // Fetch the new role by its ID
                const newRole = yield roleRepository.findOne({
                    where: { roleId: newRoleId },
                });
                if (!newRole) {
                    return { success: false, message: 'Role not found' };
                }
                // Get the old role name for the response message
                const oldRoleName = ((_a = user.role) === null || _a === void 0 ? void 0 : _a.roleName) || 'none';
                // Update the user's role without any restriction
                user.role = newRole;
                // Save the updated user
                yield userRepository.save(user);
                // Return the successful result with details
                return {
                    success: true,
                    message: `User role updated successfully from ${oldRoleName} to ${newRole.roleName}`,
                    user,
                    newRole
                };
            }
            catch (error) {
                console.error('Error updating user role:', error);
                return { success: false, message: 'Failed to update user role' };
            }
        });
    }
}
exports.UserRepository = UserRepository;
