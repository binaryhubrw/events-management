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
exports.OrganizationRepository = void 0;
const Database_1 = require("../config/Database");
const Organization_1 = require("../models/Organization");
const User_1 = require("../models/User");
const In_1 = require("typeorm/find-options/operator/In");
class OrganizationRepository {
    // Get all organizations
    static getAll() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const organizations = yield Database_1.AppDataSource.getRepository(Organization_1.Organization).find({
                    relations: ['user', 'user.role', 'user.organizations'],
                });
                return { success: true, data: organizations };
            }
            catch (error) {
                return { success: false, message: 'Failed to fetch organizations' };
            }
        });
    }
    // Get an organization by ID
    static getById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!id) {
                return { success: false, message: 'Organization ID is required' };
            }
            try {
                const organization = yield Database_1.AppDataSource.getRepository(Organization_1.Organization).findOne({ where: { organizationId: id },
                    relations: ['user', 'user.role', 'user.organizations'], });
                if (!organization) {
                    return { success: false, message: 'Organization not found' };
                }
                return { success: true, data: organization };
            }
            catch (error) {
                return { success: false, message: 'Failed to fetch organization' };
            }
        });
    }
    // Create a new organization
    static create(data) {
        var _a, _b;
        if (!data.OrganizationName || !data.ContactEmail || !data.Address || !data.OrganizationType) {
            return { success: false, message: 'Required fields are missing' };
        }
        const organization = new Organization_1.Organization();
        organization.organizationName = data.OrganizationName;
        organization.description = (_a = data.Description) !== null && _a !== void 0 ? _a : '';
        organization.contactEmail = data.ContactEmail;
        organization.contactPhone = (_b = data.ContactPhone) !== null && _b !== void 0 ? _b : '';
        organization.address = data.Address;
        organization.organizationType = data.OrganizationType;
        return { success: true, data: organization };
    }
    // Save an organization
    static save(org) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!org.organizationName || !org.contactEmail || !org.address || !org.organizationType) {
                return { success: false, message: 'Required fields are missing' };
            }
            try {
                // Check if the organization already exists by name or email
                const existingOrganization = yield Database_1.AppDataSource.getRepository(Organization_1.Organization).findOne({
                    where: [
                        { organizationName: org.organizationName },
                        { contactEmail: org.contactEmail },
                    ],
                });
                if (existingOrganization) {
                    return {
                        success: false,
                        message: 'Organization with this name or email already exists.You can Join it!!!',
                        data: existingOrganization,
                    };
                }
                // Save the new organization
                const savedOrganization = yield Database_1.AppDataSource.getRepository(Organization_1.Organization).save(org);
                return { success: true, data: savedOrganization, message: 'Organization saved successfully' };
            }
            catch (error) {
                console.error('Error saving organization:', error);
                return { success: false, message: 'Failed to save organization' };
            }
        });
    }
    // Update an organization
    static update(id, data) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            if (!id) {
                return { success: false, message: 'Organization ID is required' };
            }
            try {
                const repo = Database_1.AppDataSource.getRepository(Organization_1.Organization);
                const organization = yield repo.findOne({ where: { organizationId: id } });
                if (!organization) {
                    return { success: false, message: 'Organization not found' };
                }
                repo.merge(organization, {
                    organizationName: (_a = data.OrganizationName) !== null && _a !== void 0 ? _a : organization.organizationName,
                    description: (_b = data.Description) !== null && _b !== void 0 ? _b : organization.description,
                    contactEmail: (_c = data.ContactEmail) !== null && _c !== void 0 ? _c : organization.contactEmail,
                    contactPhone: (_d = data.ContactPhone) !== null && _d !== void 0 ? _d : organization.contactPhone,
                    address: (_e = data.Address) !== null && _e !== void 0 ? _e : organization.address,
                    organizationType: (_f = data.OrganizationType) !== null && _f !== void 0 ? _f : organization.organizationType,
                });
                const updatedOrganization = yield repo.save(organization);
                return { success: true, data: updatedOrganization };
            }
            catch (error) {
                return { success: false, message: 'Failed to update organization' };
            }
        });
    }
    // Delete an organization
    static delete(id) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!id) {
                return { success: false, message: 'Organization ID is required' };
            }
            try {
                const result = yield Database_1.AppDataSource.getRepository(Organization_1.Organization).delete(id);
                if (result.affected === 0) {
                    return { success: false, message: 'Organization not found or already deleted' };
                }
                return { success: true, message: 'Organization deleted successfully' };
            }
            catch (error) {
                return { success: false, message: 'Failed to delete organization' };
            }
        });
    }
    static assignUsersToOrganization(userIds, organizationId) {
        return __awaiter(this, void 0, void 0, function* () {
            const userRepository = Database_1.AppDataSource.getRepository(User_1.User);
            const organizationRepository = Database_1.AppDataSource.getRepository(Organization_1.Organization);
            try {
                // Fetch the organization
                const organization = yield organizationRepository.findOne({
                    where: { organizationId }
                });
                if (!organization) {
                    return { success: false, message: 'Organization not found' };
                }
                // Get all the users by their IDs
                const users = yield userRepository.findBy({ userId: (0, In_1.In)(userIds) });
                if (users.length === 0) {
                    return { success: false, message: 'No valid users found' };
                }
                const assignedOrganizations = [];
                // For each user, create a copy of the organization or update existing
                for (const user of users) {
                    // Check if this user is already assigned to this organization
                    const existingAssignment = yield organizationRepository.findOne({
                        where: {
                            organizationId,
                            user: { userId: user.userId }
                        }
                    });
                    if (existingAssignment) {
                        // Skip this user as they're already assigned
                        continue;
                    }
                    // If it's a new organization, we'll clone it for each user
                    // (Note: This approach depends on your specific requirements)
                    if (userIds.length > 1) {
                        // Create a new organization entry for each user except the first one
                        const orgCopy = organizationRepository.create(Object.assign(Object.assign({}, organization), { user: user // Assign the user object directly as a relation
                         }));
                        const savedOrg = yield organizationRepository.save(orgCopy);
                        assignedOrganizations.push(savedOrg);
                    }
                    else {
                        // If it's just one user, update the existing organization
                        organization.user = user;
                        organization.user = user;
                        const updatedOrg = yield organizationRepository.save(organization);
                        assignedOrganizations.push(updatedOrg);
                    }
                }
                return {
                    success: true,
                    message: `${assignedOrganizations.length} assignments created successfully`,
                    assignedOrganizations
                };
            }
            catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Unknown error';
                console.error('Error assigning users to organization:', errorMessage);
                return { success: false, message: 'Failed to assign users to organization' };
            }
        });
    }
}
exports.OrganizationRepository = OrganizationRepository;
