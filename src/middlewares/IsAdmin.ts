import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './AuthMiddleware';
import { AppDataSource } from '../config/Database';
import { User } from '../models/User';

export const isAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const userId = req.user?.userId;

        if (!userId) {
            res.status(401).json({ message: 'Unauthorized: No user ID found' });
            return;
        }

        const userRepository = AppDataSource.getRepository(User);
        const user = await userRepository.findOne({
            where: { userId },
            relations: ['role'], // Make sure 'role' relation is defined in User entity
        });

        // Check if user exists AND if their role is admin
        if (!user || !user.role || user.role.roleName.toLowerCase() !== 'admin') {
            res.status(403).json({ message: 'Forbidden: Admins only' });
            return;
        }

        // If the user is found and is an admin, proceed
        next();

    } catch (error) {
        console.error("Error in isAdmin middleware:", error); // Log the server-side error
        res.status(500).json({ message: 'Server Error', error: (error as Error).message });
    }
};
