import { Request, Response } from 'express';
import { ResourceRepository } from '../repositories/ResourceRepository';

export class ResourceController {
    // Create a new resource
    static async createResource(req: Request, res: Response): Promise<Response> {
        try {
            const newResource = await ResourceRepository.createResource(req.body);
            return res.status(201).json(newResource);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Failed to create resource' });
        }
    }

    // Get all resources
    static async getAllResources(req: Request, res: Response): Promise<Response> {
        try {
            const resources = await ResourceRepository.findAllResources();
            return res.status(200).json(resources);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Failed to fetch resources' });
        }
    }

    // Get a resource by ID
    static async getResourceById(req: Request, res: Response): Promise<Response> {
        try {
            const resource = await ResourceRepository.findResourceById(req.params.id);
            if (!resource) {
                return res.status(404).json({ message: 'Resource not found' });
            }
            return res.status(200).json(resource);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Failed to fetch resource' });
        }
    }

    // Update a resource
    static async updateResource(req: Request, res: Response): Promise<Response> {
        try {
            const updatedResource = await ResourceRepository.updateResource(req.params.id, req.body);
            if (!updatedResource) {
                return res.status(404).json({ message: 'Resource not found' });
            }
            return res.status(200).json(updatedResource);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Failed to update resource' });
        }
    }

    // Delete a resource
    static async deleteResource(req: Request, res: Response): Promise<Response> {
        try {
            const deleted = await ResourceRepository.deleteResource(req.params.id);
            if (!deleted) {
                return res.status(404).json({ message: 'Resource not found' });
            }
            return res.status(200).json({ message: 'Resource deleted successfully' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Failed to delete resource' });
        }
    }
}
