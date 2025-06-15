// src/routes/OrganizationRoutes.ts
import { Router } from 'express';
import { OrganizationController } from '../controller/OrganizationController';
import { verifyJWT } from '../middlewares/AuthMiddleware';

const router = Router();

// All other organization routes
router.get('/all', OrganizationController.getAll);
router.get('/:id', OrganizationController.getById);
router.post('/add', OrganizationController.create);
router.put('/update/:id',verifyJWT, OrganizationController.update);
router.delete('/delete/:id',verifyJWT, OrganizationController.delete);

// Add user to organization (ensure the correct route is defined)
router.put('/:organizationId/addUser',verifyJWT, OrganizationController.assignUsersToOrganization);

export default router;
