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
exports.OrganizationController = void 0;
const OrganizationRepository_1 = require("../repositories/OrganizationRepository");
class OrganizationController {
    // Get all organizations
    static getAll(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const result = yield OrganizationRepository_1.OrganizationRepository.getAll();
                if (result.success) {
                    res.status(200).json({ success: true, data: result.data });
                }
                else {
                    res.status(500).json({ success: false, message: result.message });
                }
            }
            catch (err) {
                res.status(500).json({ success: false, message: 'Failed to fetch organizations', error: err.message });
            }
        });
    }
    // Get an organization by ID
    static getById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({ success: false, message: 'Organization ID is required' });
            }
            try {
                const result = yield OrganizationRepository_1.OrganizationRepository.getById(id);
                if (result.success) {
                    res.status(200).json({ success: true, data: result.data });
                }
                else {
                    res.status(404).json({ success: false, message: result.message });
                }
            }
            catch (err) {
                res.status(500).json({ success: false, message: 'Failed to fetch organization', error: err.message });
            }
        });
    }
    // Create a new organization
    static create(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { OrganizationName, Description, ContactEmail, ContactPhone, Address, OrganizationType } = req.body;
            if (!OrganizationName || !ContactEmail || !Address || !OrganizationType) {
                res.status(400).json({ success: false, message: 'Required fields are missing' });
            }
            try {
                const createResult = OrganizationRepository_1.OrganizationRepository.create({
                    OrganizationName,
                    Description,
                    ContactEmail,
                    ContactPhone,
                    Address,
                    OrganizationType,
                });
                if (!createResult.success) {
                    res.status(400).json({ success: false, message: createResult.message });
                }
                const saveResult = yield OrganizationRepository_1.OrganizationRepository.save(createResult.data);
                if (saveResult.success) {
                    res.status(201).json({ success: true, message: 'Organization created successfully', data: saveResult.data });
                }
                else {
                    res.status(400).json({ success: false, message: saveResult.message });
                }
            }
            catch (err) {
                res.status(500).json({ success: false, message: 'Failed to create organization', error: err.message });
            }
        });
    }
    // Update an existing organization
    static update(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            const { OrganizationName, Description, ContactEmail, ContactPhone, Address, OrganizationType } = req.body;
            console.log("id's from body:", req.body);
            if (!id) {
                res.status(400).json({ success: false, message: 'Organization ID is required' });
            }
            try {
                const updateResult = yield OrganizationRepository_1.OrganizationRepository.update(id, {
                    OrganizationName,
                    Description,
                    ContactEmail,
                    ContactPhone,
                    Address,
                    OrganizationType,
                });
                if (updateResult.success) {
                    res.status(200).json({ success: true, message: 'Organization updated successfully', data: updateResult.data });
                }
                else {
                    res.status(404).json({ success: false, message: updateResult.message });
                }
            }
            catch (err) {
                res.status(500).json({ success: false, message: 'Failed to update organization', error: err.message });
            }
        });
    }
    // Delete an organization
    static delete(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({ success: false, message: 'Organization ID is required' });
            }
            try {
                const deleteResult = yield OrganizationRepository_1.OrganizationRepository.delete(id);
                if (deleteResult.success) {
                    res.status(200).json({ success: true, message: deleteResult.message });
                }
                else {
                    res.status(404).json({ success: false, message: deleteResult.message });
                }
            }
            catch (err) {
                res.status(500).json({ success: false, message: 'Failed to delete organization', error: err.message });
            }
        });
    }
    static assignUsersToOrganization(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Get organizationId from URL parameters
                const { organizationId } = req.params;
                // Get userIds from request body
                const { userIds } = req.body;
                if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
                    res.status(400).json({
                        success: false,
                        message: 'userIds array is required in the request body',
                    });
                    return;
                }
                if (!organizationId) {
                    res.status(400).json({
                        success: false,
                        message: 'organizationId is required in the URL',
                    });
                    return;
                }
                // Call the repository method
                const result = yield OrganizationRepository_1.OrganizationRepository.assignUsersToOrganization(userIds, organizationId);
                if (result.success) {
                    res.status(200).json({
                        success: true,
                        message: result.message,
                        assignedOrganizations: result.assignedOrganizations
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
                console.error('Error in assignUsersToOrganization controller:', error);
                res.status(500).json({
                    success: false,
                    message: 'Internal server error occurred while assigning users to organization',
                });
            }
        });
    }
}
exports.OrganizationController = OrganizationController;
