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
exports.RoleController = void 0;
const RoleRepository_1 = require("../repositories/RoleRepository");
class RoleController {
    static create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { roleName, description, permissions } = req.body;
                if (!roleName || roleName.length < 3 || roleName.length > 50) {
                    res.status(400).json({ success: false, message: 'Role name must be between 3 and 50 characters' });
                    return;
                }
                const existingRole = yield RoleRepository_1.RoleRepository.findRoleByName(roleName);
                if (existingRole) {
                    res.status(400).json({ success: false, message: 'Role already exists' });
                    return;
                }
                const role = RoleRepository_1.RoleRepository.createRole({
                    RoleName: roleName,
                    Description: description,
                    Permissions: permissions,
                });
                const result = yield RoleRepository_1.RoleRepository.saveRole(role);
                if (!result.success) {
                    res.status(400).json({ success: false, message: result.message });
                    return;
                }
                res.status(201).json({ success: true, message: 'Role created successfully', role });
            }
            catch (error) {
                console.error('Error creating role:', error);
                res.status(500).json({ success: false, message: 'Internal server error' });
            }
        });
    }
    static getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const roles = yield RoleRepository_1.RoleRepository.getAllRoles();
                res.status(200).json({ success: true, roles });
            }
            catch (error) {
                console.error('Error retrieving roles:', error);
                res.status(500).json({ success: false, message: 'Internal server error' });
            }
        });
    }
    static getById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const role = yield RoleRepository_1.RoleRepository.getRoleById(req.params.id);
                if (!role) {
                    res.status(404).json({ success: false, message: 'Role not found' });
                    return;
                }
                res.status(200).json({ success: true, role });
            }
            catch (error) {
                console.error('Error retrieving role by ID:', error);
                res.status(500).json({ success: false, message: 'Internal server error' });
            }
        });
    }
    static update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { roleName, description, permissions } = req.body;
                if (!id) {
                    res.status(400).json({ success: false, message: 'Role ID is required' });
                    return;
                }
                if (roleName && (roleName.length < 3 || roleName.length > 50)) {
                    res.status(400).json({ success: false, message: 'Role name must be between 3 and 50 characters' });
                    return;
                }
                const existingRole = yield RoleRepository_1.RoleRepository.getRoleById(id);
                if (!existingRole) {
                    res.status(404).json({ success: false, message: 'Role not found' });
                    return;
                }
                const updatedRole = yield RoleRepository_1.RoleRepository.updateRole(id, {
                    RoleName: roleName,
                    Description: description,
                    Permissions: permissions,
                });
                if ('error' in updatedRole) {
                    res.status(400).json({ success: false, message: updatedRole.error });
                    return;
                }
                res.status(200).json({ success: true, message: 'Role updated successfully', role: updatedRole });
            }
            catch (error) {
                console.error('Error updating role:', error);
                res.status(500).json({ success: false, message: 'Internal server error' });
            }
        });
    }
    static deleteById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                // Validate Role ID
                if (!id || typeof id !== 'string' || id.trim() === '') {
                    res.status(400).json({ success: false, message: 'Invalid Role ID provided.' });
                    return;
                }
                // Call the repository method to delete the role
                const result = yield RoleRepository_1.RoleRepository.deleteRole(id);
                // Handle the response from the repository
                if ('success' in result && result.success === false) {
                    res.status(404).json({ success: false, message: 'Role not found.' });
                    return;
                }
                if ('error' in result) {
                    res.status(400).json({ success: false, message: result.error });
                    return;
                }
                res.status(200).json({ success: true, message: 'Role deleted successfully.' });
            }
            catch (error) {
                console.error('Error deleting role:', error);
                res.status(500).json({ success: false, message: 'Internal server error.' });
            }
        });
    }
}
exports.RoleController = RoleController;
