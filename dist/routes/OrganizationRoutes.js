"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/routes/OrganizationRoutes.ts
const express_1 = require("express");
const OrganizationController_1 = require("../controller/OrganizationController");
const AuthMiddleware_1 = require("../middlewares/AuthMiddleware");
const router = (0, express_1.Router)();
// All other organization routes
router.get('/all', OrganizationController_1.OrganizationController.getAll);
router.get('/:id', OrganizationController_1.OrganizationController.getById);
router.post('/add', OrganizationController_1.OrganizationController.create);
router.put('/update/:id', AuthMiddleware_1.verifyJWT, OrganizationController_1.OrganizationController.update);
router.delete('/delete/:id', AuthMiddleware_1.verifyJWT, OrganizationController_1.OrganizationController.delete);
// Add user to organization (ensure the correct route is defined)
router.put('/:organizationId/addUser', AuthMiddleware_1.verifyJWT, OrganizationController_1.OrganizationController.assignUsersToOrganization);
exports.default = router;
