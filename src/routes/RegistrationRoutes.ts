//@ts-check

import express from 'express';
import { TicketService } from '../services/registrations/TicketService';
import { RegistrationController } from '../controller/RegistrationController';
import { Request, Response, NextFunction } from 'express'; // Added NextFunction for `next`
import { isAdmin } from '../middlewares/IsAdmin';
import { verifyJWT } from '../middlewares/AuthMiddleware';
import { RegistrationRepository } from '../repositories/RegistrationRepository'; // <--- ADD THIS IMPORT
import { AppDataSource } from '../config/Database'; // You might need this if RegistrationRepository needs it for .getRepository()
import { AuthenticatedRequest } from '../middlewares/AuthMiddleware'; // Import AuthenticatedRequest if you want better typing

const router = express.Router();

// Core Registration Management
//@ts-expect-error // Consider resolving this type error if createRegistration is not correctly typed
router.post('/', RegistrationController.createRegistration);
router.get('/', RegistrationController.getAllRegistrations);
router.get('/:userId', verifyJWT, isAdmin, RegistrationController.getUserTicketCostSummary);
router.put('/:id', RegistrationController.updateRegistration);

// --- Ticket Management Routes ---

// Get ticket details with calculated price
router.get("/:id/details", verifyJWT, (req: Request, res: Response) => TicketService.getTicketDetails(req as any, res));

// Transfer a ticket to another user
router.put("/:id/transfer", verifyJWT, TicketService.transferTicket.bind(TicketService));

// Add tickets to a registration (increment quantity)
router.put("/:id/add-tickets", verifyJWT, TicketService.AddToCartTheNoOfTickets.bind(TicketService));

// Cancel specific tickets within a registration
router.put("/:id/cancel", verifyJWT, TicketService.cancelRegistration.bind(TicketService));

// Resend the ticket email for a registration
router.post("/:id/resend-ticket", verifyJWT, async (req: Request, res: Response, next: NextFunction) => { // Added NextFunction type
    try {
        // Use AuthenticatedRequest type if available, otherwise keep (req as any)
        const typedReq = req as AuthenticatedRequest;
        const loggedInUserId = typedReq.user?.userId;
        const loggedInUserRoles = typedReq.user?.roles?.map((role: any) => typeof role === 'string' ? role : role.roleName) || [];
        const { id: registrationId } = typedReq.params;
        const { userEmail } = typedReq.body; // Optional: specific email to resend to

        if (!loggedInUserId) {
            res.status(401).json({ success: false, message: 'Unauthorized: User information is missing.' });
            return;
        }
        if (!registrationId) {
            res.status(400).json({ success: false, message: 'Registration ID is required.' });
            return;
        }

        // Authorization Check: Fetch registration to apply 'isAuthorizedForRegistration' logic
        // This ensures only admins, managers, or the owner/buyer can resend tickets.
        const registration = await RegistrationRepository.getRepository().findOne({ // <--- CORRECTED: Direct call to RegistrationRepository
            where: { registrationId },
            relations: ['buyer', 'user'] // Need buyer/user for authorization
        });

        if (!registration) {
            res.status(404).json({ success: false, message: 'Registration not found.' });
            return;
        }

        // isAuthorizedForRegistration is a private method in TicketService, but can be accessed for testing purposes with []
        // In a real application, you might want to expose a public static `authorizeRegistrationAccess` helper on TicketService.
        if (!TicketService['isAuthorizedForRegistration'](
            loggedInUserId,
            loggedInUserRoles,
            registration
        )) {
            res.status(403).json({ success: false, message: 'Forbidden: You do not have permission to resend this ticket.' });
            return;
        }

        const success = await TicketService.resendTicket(registrationId, userEmail);

        if (success) {
            res.status(200).json({ success: true, message: 'Ticket email resent successfully.' });
        } else {
            res.status(500).json({ success: false, message: 'Failed to resend ticket email. Check server logs.' });
        }
    } catch (error) {
        console.error(`Error in resend-ticket route for registration ${req.params.id}:`, error);
        next(error); // Pass the error to the next middleware (error handling middleware)
    }
});

// Generate and download the ticket PDF for a registration
router.get("/:id/ticket-pdf", verifyJWT, async (req: Request, res: Response) => {
    // Use AuthenticatedRequest type if available, otherwise keep (req as any)
    const typedReq = req as AuthenticatedRequest;
    const loggedInUserId = typedReq.user?.userId;
    const loggedInUserRoles = typedReq.user?.roles?.map((role: any) => typeof role === 'string' ? role : role.roleName) || [];
    const { id: registrationId } = typedReq.params;

    if (!loggedInUserId) {
        res.status(401).json({ success: false, message: 'Unauthorized: User information is missing.' });
        return;
    }
    if (!registrationId) {
        res.status(400).json({ success: false, message: 'Registration ID is required.' });
        return;
    }

    try {
        // Authorization Check: Fetch registration to apply 'isAuthorizedForRegistration' logic
        // This ensures only admins, managers, or the owner/buyer can download the PDF.
        const registration = await RegistrationRepository.getRepository().findOne({ // <--- CORRECTED: Direct call to RegistrationRepository
            where: { registrationId },
            relations: ['buyer', 'user']
        });

        if (!registration) {
            res.status(404).json({ success: false, message: 'Registration not found.' });
            return;
        }

        if (!TicketService['isAuthorizedForRegistration'](
            loggedInUserId,
            loggedInUserRoles,
            registration
        )) {
            res.status(403).json({ success: false, message: 'Forbidden: You do not have permission to access this ticket PDF.' });
            return;
        }

        const pdfBuffer = await TicketService.generateTicketPdf(registrationId);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=ticket-${registrationId}.pdf`);
        res.send(pdfBuffer);

    } catch (error) {
        console.error(`Error in ticket-pdf route for registration ${registrationId}:`, error);
        res.status(500).json({ success: false, message: 'Failed to generate ticket PDF due to a server error.' });
    }
});

// --- QR Code Management Routes ---

router.delete("/:registrationId", RegistrationController.deleteRegistration);
router.get("/:id/qr-code/image", RegistrationController.getRegistrationQrCodeImage);
router.get("/:id/qr-code", RegistrationController.getRegistrationQrCode);
router.post("/:id/qr-code/regenerate", RegistrationController.regenerateQrCode);
router.get("/qr-code/validate/:qrCode", RegistrationController.validateQrCode);

export default router;