import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const validate = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next(); // No validation errors, proceed to the next middleware/controller
    }

    const extractedErrors: { [key: string]: string[] } = {};
    errors.array().forEach(err => {
        // Check if the error is an instance of ValidationError (express-validator 6+)
        // if ('path' in err && typeof err.path === 'string') {
        //     if (!extractedErrors[err.path]) {
        //         extractedErrors[err.path] = [];
        //     }
        //     extractedErrors[err.path].push(err.msg);
        // } else {
        //     // Fallback for older versions or different error structures
        //     if (!extractedErrors.general) {
        //         extractedErrors.general = [];
        //     }
        //     extractedErrors.general.push(err.msg);
        // }
        // Simpler for common cases, you might want more detailed error structure
        if ('path' in err) {
            extractedErrors[err.path as string] = extractedErrors[err.path as string] || [];
            (extractedErrors[err.path as string] as string[]).push(err.msg);
        } else {
             extractedErrors['general'] = extractedErrors['general'] || [];
             (extractedErrors['general'] as string[]).push(err.msg);
        }
    });

    return res.status(400).json({
        message: 'Validation failed',
        errors: extractedErrors,
    });
};