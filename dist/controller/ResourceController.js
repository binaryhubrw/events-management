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
exports.ResourceController = void 0;
const ResourceRepository_1 = require("../repositories/ResourceRepository");
class ResourceController {
    // Create a new resource
    static createResource(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const newResource = yield ResourceRepository_1.ResourceRepository.createResource(req.body);
                return res.status(201).json(newResource);
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Failed to create resource' });
            }
        });
    }
    // Get all resources
    static getAllResources(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const resources = yield ResourceRepository_1.ResourceRepository.findAllResources();
                return res.status(200).json(resources);
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Failed to fetch resources' });
            }
        });
    }
    // Get a resource by ID
    static getResourceById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const resource = yield ResourceRepository_1.ResourceRepository.findResourceById(req.params.id);
                if (!resource) {
                    return res.status(404).json({ message: 'Resource not found' });
                }
                return res.status(200).json(resource);
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Failed to fetch resource' });
            }
        });
    }
    // Update a resource
    static updateResource(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const updatedResource = yield ResourceRepository_1.ResourceRepository.updateResource(req.params.id, req.body);
                if (!updatedResource) {
                    return res.status(404).json({ message: 'Resource not found' });
                }
                return res.status(200).json(updatedResource);
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Failed to update resource' });
            }
        });
    }
    // Delete a resource
    static deleteResource(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const deleted = yield ResourceRepository_1.ResourceRepository.deleteResource(req.params.id);
                if (!deleted) {
                    return res.status(404).json({ message: 'Resource not found' });
                }
                return res.status(200).json({ message: 'Resource deleted successfully' });
            }
            catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Failed to delete resource' });
            }
        });
    }
}
exports.ResourceController = ResourceController;
