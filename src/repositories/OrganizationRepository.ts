import { AppDataSource } from '../config/Database';
import { Organization } from '../models/Organization';
import { OrganizationInterface } from '../interfaces/OrganizationInterface';//all dto's
import { User } from '../models/User';
import { In } from 'typeorm/find-options/operator/In';

export class OrganizationRepository {
  // Get all organizations
  static async getAll(): Promise<{ success: boolean; data?: Organization[]; message?: string }> {
    try {
      const organizations = await AppDataSource.getRepository(Organization).find(
        {
          relations: ['user', 'user.role', 'user.organizations'],
        }
      );
      return { success: true, data: organizations };
    } catch (error) {
      return { success: false, message: 'Failed to fetch organizations' };
    }
  }

  // Get an organization by ID
  static async getById(id: string): Promise<{ success: boolean; data?: Organization; message?: string }> {
    if (!id) {
      return { success: false, message: 'Organization ID is required' };
    }

    try {
      const organization = await AppDataSource.getRepository(Organization).findOne({ where: { organizationId: id } ,
        relations: ['user', 'user.role', 'user.organizations'],});
      if (!organization) {
        return { success: false, message: 'Organization not found' };
      }
      return { success: true, data: organization };
    } catch (error) {
      return { success: false, message: 'Failed to fetch organization' };
    }
  }

  // Create a new organization
  static create(data: Partial<OrganizationInterface>): { success: boolean; data?: Organization; message?: string } {
    if (!data.organizationName || !data.contactEmail || !data.address || !data.organizationType) {
      return { success: false, message: 'Required fields are missing' };
    }

    const organization = new Organization();
    organization.organizationName = data.organizationName;
    organization.description = data.description ?? '';
    organization.contactEmail = data.contactEmail;
    organization.contactPhone = data.contactPhone ?? '';
    organization.address = data.address;
    organization.organizationType = data.organizationType;

    return { success: true, data: organization };
  }

  // Save an organization
  static async save(org: Organization): Promise<{ success: boolean; data?: Organization; message?: string }> {
    if (!org.organizationName || !org.contactEmail || !org.address || !org.organizationType) {
      return { success: false, message: 'Required fields are missing' };
    }
    
    try {
      // Check if the organization already exists by name or email
      const existingOrganization = await AppDataSource.getRepository(Organization).findOne({
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
      const savedOrganization = await AppDataSource.getRepository(Organization).save(org);
      return { success: true, data: savedOrganization, message: 'Organization saved successfully' };
    
    } catch (error) {
      console.error('Error saving organization:', error); 
      return { success: false, message: 'Failed to save organization' };
    }
    
      }
       
      
    
  // Update an organization
  static async update(
    id: string,
    data: Partial<OrganizationInterface>
  ): Promise<{ success: boolean; data?: Organization; message?: string }> {
    if (!id) {
      return { success: false, message: 'Organization ID is required' };
    }

    try {
      const repo = AppDataSource.getRepository(Organization);
      const organization = await repo.findOne({ where: { organizationId: id } });

      if (!organization) {
        return { success: false, message: 'Organization not found' };
      }

      repo.merge(organization, {
        organizationName: data.organizationName ?? organization.organizationName,
        description: data.description ?? organization.description,
        contactEmail: data.contactEmail ?? organization.contactEmail,
        contactPhone: data.contactPhone ?? organization.contactPhone,
        address: data.address ?? organization.address,
        organizationType: data.organizationType ?? organization.organizationType,
      });

      const updatedOrganization = await repo.save(organization);
      return { success: true, data: updatedOrganization };
    } catch (error) {
      return { success: false, message: 'Failed to update organization' };
    }
  }

  // Delete an organization
  static async delete(id: string): Promise<{ success: boolean; message: string }> {
    if (!id) {
      return { success: false, message: 'Organization ID is required' };
    }

    try {
      const result = await AppDataSource.getRepository(Organization).delete(id);
      if (result.affected === 0) {
        return { success: false, message: 'Organization not found or already deleted' };
      }
      return { success: true, message: 'Organization deleted successfully' };
    } catch (error) {
      return { success: false, message: 'Failed to delete organization' };
    }
  }

  static async assignUsersToOrganization(
    userIds: string[],
    organizationId: string
  ): Promise<{ success: boolean; message: string; assignedOrganizations?: Organization[] }> {
    const userRepository = AppDataSource.getRepository(User);
    const organizationRepository = AppDataSource.getRepository(Organization);
  
    try {
      // Fetch the organization
      const organization = await organizationRepository.findOne({
        where: { organizationId }
      });
  
      if (!organization) {
        return { success: false, message: 'Organization not found' };
      }

      // Get all the users by their IDs
      const users = await userRepository.findBy({ userId: In(userIds) });
      
      if (users.length === 0) {
        return { success: false, message: 'No valid users found' };
      }
      
      const assignedOrganizations: Organization[] = [];
      
      // For each user, create a copy of the organization or update existing
      for (const user of users) {
        // Check if this user is already assigned to this organization
        const existingAssignment = await organizationRepository.findOne({
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
          const orgCopy = organizationRepository.create({
            ...organization,
            user: user // Assign the user object directly as a relation
          });
          
          const savedOrg = await organizationRepository.save(orgCopy);
          assignedOrganizations.push(savedOrg);
        } else {
          // If it's just one user, update the existing organization
          organization.user = user;
          organization.user = user;
          const updatedOrg = await organizationRepository.save(organization);
          assignedOrganizations.push(updatedOrg);
        }
      }
  
      return {
        success: true,
        message: `${assignedOrganizations.length} assignments created successfully`,
        assignedOrganizations
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error assigning users to organization:', errorMessage);
      return { success: false, message: 'Failed to assign users to organization' };
    }
  }
}
  