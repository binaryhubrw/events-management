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
exports.RoleRepository = void 0;
// src/repositories/RoleRepository.ts
const Database_1 = require("../config/Database");
const Role_1 = require("../models/Role");
class RoleRepository {
    static findRoleByName(roleName) {
        return __awaiter(this, void 0, void 0, function* () {
            const roleRepository = Database_1.AppDataSource.getRepository(Role_1.Role);
            return yield roleRepository.findOne({ where: { roleName },
                relations: ['users',] });
        });
    }
    static createRole(data) {
        var _a, _b, _c;
        const role = new Role_1.Role();
        role.roleName = (_a = data.RoleName) !== null && _a !== void 0 ? _a : '';
        role.description = (_b = data.Description) !== null && _b !== void 0 ? _b : '';
        role.permissions = (_c = data.Permissions) !== null && _c !== void 0 ? _c : [];
        return role;
    }
    static saveRole(role) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const roleRepository = Database_1.AppDataSource.getRepository(Role_1.Role);
            if (!role.roleName || role.roleName.length < 3 || role.roleName.length > 50) {
                return { success: false, message: 'Role name must be between 3 and 50 characters' };
            }
            try {
                yield roleRepository.save(role);
                return { success: true, message: 'Role saved successfully',
                    role: {
                        roleId: role.roleId,
                        roleName: role.roleName,
                        description: role.description,
                        permissions: role.permissions,
                    },
                    users: ((_a = role.users) === null || _a === void 0 ? void 0 : _a.map((user) => {
                        var _a;
                        return ({
                            userId: user.userId,
                            username: user.username,
                            email: user.email,
                            firstName: user.firstName,
                            lastName: user.lastName,
                            phoneNumber: (_a = user.phoneNumber) !== null && _a !== void 0 ? _a : '',
                        });
                    })) || [],
                };
            }
            catch (err) {
                return {
                    success: false,
                    message: 'Database error: ' + (err instanceof Error ? err.message : 'Unknown error')
                };
            }
        });
    }
    static getAllRoles() {
        return __awaiter(this, void 0, void 0, function* () {
            const roleRepository = Database_1.AppDataSource.getRepository(Role_1.Role);
            return yield roleRepository.find({
                relations: ['users',], // Include relations if needed
            });
        });
    }
    static getRoleById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const roleRepository = Database_1.AppDataSource.getRepository(Role_1.Role);
            return yield roleRepository.findOne({ where: { roleId: id }, relations: ['users'] });
        });
    }
    static updateRole(id, roleData) {
        return __awaiter(this, void 0, void 0, function* () {
            const roleRepository = Database_1.AppDataSource.getRepository(Role_1.Role);
            if (!id || typeof id !== "string" || id.trim() === "") {
                return { error: "Invalid Role ID provided." };
            }
            try {
                const role = yield roleRepository.findOne({ where: { roleId: id } });
                if (!role) {
                    return { error: "Role not found." };
                }
                // Structured updates
                role.roleName = roleData.RoleName || role.roleName;
                role.description = roleData.Description || role.description;
                role.permissions = roleData.Permissions || role.permissions;
                const updatedRole = yield roleRepository.save(role);
                return updatedRole;
            }
            catch (error) {
                console.error("Error updating role:", error);
                return { error: "An error occurred while updating the role." };
            }
        });
    }
    static deleteRole(roleId) {
        return __awaiter(this, void 0, void 0, function* () {
            const roleRepository = Database_1.AppDataSource.getRepository(Role_1.Role);
            try {
                const role = yield roleRepository.findOne({ where: { roleId } });
                if (!role) {
                    return { error: 'Role not found for deletion.' };
                }
                // Proceed with deletion
                yield roleRepository.remove(role);
                return { success: true };
            }
            catch (error) {
                console.error('Error deleting role:', error);
                return { error: 'An error occurred while deleting the role.' };
            }
        });
    }
}
exports.RoleRepository = RoleRepository;
