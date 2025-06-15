"use strict";
// @ts-nocheck
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ResourceController_1 = require("../controller/ResourceController"); // Adjust the path if needed
const router = express_1.default.Router();
// Define the routes for the ResourceController
router.post('/create-resource', ResourceController_1.ResourceController.createResource); // Create a new resource
router.get('/find-all', ResourceController_1.ResourceController.getAllResources); // Get all resources
router.get('/find-one/:id', ResourceController_1.ResourceController.getResourceById); // Get a resource by ID
router.put('/update-resource/:id', ResourceController_1.ResourceController.updateResource); // Update a resource
router.delete('/delete-resource/:id', ResourceController_1.ResourceController.deleteResource); // Delete a resource
exports.default = router;
