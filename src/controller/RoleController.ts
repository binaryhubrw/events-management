// src/controller/RoleController.ts
import { Request, Response } from 'express';
import { RoleRepository } from '../repositories/RoleRepository';

export class RoleController {
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { roleName, description, permissions } = req.body;

      if (!roleName || roleName.length < 3 || roleName.length > 50) {
        res.status(400).json({ success: false, message: 'Role name must be between 3 and 50 characters' });
        return;
      }

      const existingRole = await RoleRepository.findRoleByName(roleName);
      if (existingRole) {
        res.status(400).json({ success: false, message: 'Role already exists' });
        return;
      }

      const role = RoleRepository.createRole({
        roleName: roleName,
        description: description,
        permissions: permissions,
      });

      const result = await RoleRepository.saveRole(role);
      if (!result.success) {
        res.status(400).json({ success: false, message: result.message });
        return;
      }

      res.status(201).json({ success: true, message: 'Role created successfully', role });
    } catch (error) {
      console.error('Error creating role:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const roles = await RoleRepository.getAllRoles();
      res.status(200).json({ success: true, roles });
    } catch (error) {
      console.error('Error retrieving roles:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }



  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const role = await RoleRepository.getRoleById(req.params.id);
      if (!role) {
        res.status(404).json({ success: false, message: 'Role not found' });
        return;
      }
      res.status(200).json({ success: true, role });
    } catch (error) {
      console.error('Error retrieving role by ID:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async update(req: Request, res: Response): Promise<void> {
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

      const existingRole = await RoleRepository.getRoleById(id);
      if (!existingRole) {
        res.status(404).json({ success: false, message: 'Role not found' });
        return;
      }

      const updatedRole = await RoleRepository.updateRole(id, {
        roleName: roleName,
        description: description,
        permissions: permissions,
      });

      if ('error' in updatedRole) {
        res.status(400).json({ success: false, message: updatedRole.error });
        return;
      }

      res.status(200).json({ success: true, message: 'Role updated successfully', role: updatedRole });
    } catch (error) {
      console.error('Error updating role:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }


  static async deleteById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;

    // Validate Role ID
    if (!id || typeof id !== 'string' || id.trim() === '') {
      res.status(400).json({ success: false, message: 'Invalid Role ID provided.' });
      return;
    }

    // Call the repository method to delete the role
    const result = await RoleRepository.deleteRole(id);

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
  } catch (error) {
    console.error('Error deleting role:', error);
    res.status(500).json({ success: false, message: 'Internal server error.' });
  }
}

 static async getRolesByName(req: Request, res: Response): Promise<void> {
        const { roleName } = req.body; // Get roleName from the request body

        if (!roleName || typeof roleName !== 'string' || roleName.trim() === '') {
            res.status(400).json({ success: false, message: 'Role name is required in the request body.' });
            return;
        }

        try {
            const roles = await RoleRepository.findRolesByNameIgnoreCase(roleName);

            if (roles.length === 0) {
                res.status(404).json({ success: false, message: `No roles found matching '${roleName}'.` });
                return;
            }

            res.status(200).json({ success: true, data: roles });
        } catch (error) {
            console.error('Error fetching roles by name (case-insensitive):', error);
            res.status(500).json({ success: false, message: 'Failed to retrieve roles due to a server error.' });
        }
    }

}