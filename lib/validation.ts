/**
 * Security Validation Schemas
 * Using Zod for runtime input validation and sanitization
 */

import { z } from 'zod';

// =============================================
// SANITIZATION HELPERS
// =============================================

/**
 * Sanitize text input to prevent XSS and injection attacks
 * Removes HTML tags, trims whitespace, and normalizes input
 */
export function sanitizeText(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    return input
        .trim()
        // Remove HTML tags
        .replace(/<[^>]*>/g, '')
        // Remove null bytes
        .replace(/\0/g, '')
        // Normalize whitespace
        .replace(/\s+/g, ' ')
        // Remove control characters except newlines and tabs
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * Sanitize and validate UUID format
 */
export function isValidUUID(id: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(id);
}

// =============================================
// ZOD SCHEMAS
// =============================================

// UUID Schema
export const uuidSchema = z.string().refine(isValidUUID, {
    message: 'Invalid ID format',
});

// Phone number schema (Indian format)
export const phoneSchema = z
    .string()
    .min(10, 'Phone number must be at least 10 digits')
    .max(15, 'Phone number too long')
    .regex(/^[\d\s\-+()]+$/, 'Invalid phone number format')
    .transform((val) => val.replace(/\s/g, ''));

// Month format schema (YYYY-MM)
export const monthSchema = z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Invalid month format. Use YYYY-MM');

// =============================================
// HOSTEL VALIDATION
// =============================================

export const hostelSchema = z.object({
    name: z
        .string()
        .min(3, 'Name must be at least 3 characters')
        .max(100, 'Name too long')
        .transform(sanitizeText),
    area: z
        .string()
        .min(2, 'Area must be at least 2 characters')
        .max(100, 'Area too long')
        .transform(sanitizeText),
    address: z
        .string()
        .min(10, 'Address must be at least 10 characters')
        .max(500, 'Address too long')
        .transform(sanitizeText),
    price: z
        .number()
        .positive('Price must be positive')
        .max(1000000, 'Price too high'),
    total_beds: z
        .number()
        .int('Total beds must be a whole number')
        .positive('Total beds must be positive')
        .max(10000, 'Too many beds'),
    vacant_beds: z
        .number()
        .int('Vacant beds must be a whole number')
        .min(0, 'Vacant beds cannot be negative'),
    description: z
        .string()
        .max(2000, 'Description too long')
        .transform(sanitizeText)
        .optional()
        .nullable(),
    owner_phone: phoneSchema,
});

// =============================================
// STUDENT PROFILE VALIDATION
// =============================================

export const studentProfileSchema = z.object({
    user_id: uuidSchema,
    hostel_id: uuidSchema,
    name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name too long')
        .transform(sanitizeText),
    phone_number: phoneSchema,
    parent_phone: phoneSchema.optional(),
    college_or_workplace: z
        .string()
        .max(200, 'Field too long')
        .transform(sanitizeText)
        .optional(),
    floor_number: z
        .string()
        .max(20, 'Floor number too long')
        .transform(sanitizeText)
        .optional(),
    room_number: z
        .string()
        .max(20, 'Room number too long')
        .transform(sanitizeText)
        .optional(),
});

// =============================================
// TICKET VALIDATION
// =============================================

export const ticketSchema = z.object({
    studentProfileId: uuidSchema,
    hostelId: uuidSchema,
    title: z
        .string()
        .min(5, 'Title must be at least 5 characters')
        .max(100, 'Title too long')
        .transform(sanitizeText),
    description: z
        .string()
        .min(10, 'Description must be at least 10 characters')
        .max(1000, 'Description too long')
        .transform(sanitizeText),
});

export const ticketStatusSchema = z.enum(['open', 'in_progress', 'resolved']);

export const ticketUpdateSchema = z.object({
    ticketId: uuidSchema,
    status: ticketStatusSchema,
    reply: z
        .string()
        .max(1000, 'Reply too long')
        .transform(sanitizeText)
        .optional(),
    adminNotes: z
        .string()
        .max(1000, 'Notes too long')
        .transform(sanitizeText)
        .optional(),
});

// =============================================
// UPDATE/NOTICE VALIDATION
// =============================================

export const updateSchema = z.object({
    title: z
        .string()
        .min(3, 'Title must be at least 3 characters')
        .max(200, 'Title too long')
        .transform(sanitizeText),
    content: z
        .string()
        .min(10, 'Content must be at least 10 characters')
        .max(5000, 'Content too long')
        .transform(sanitizeText),
    hostelId: uuidSchema.optional().nullable(),
    isGlobal: z.boolean().default(false),
});

// =============================================
// PAYMENT VALIDATION
// =============================================

export const paymentSchema = z.object({
    paymentId: uuidSchema,
    notes: z
        .string()
        .max(500, 'Notes too long')
        .transform(sanitizeText)
        .optional(),
});

export const generateDuesSchema = z.object({
    hostelId: uuidSchema,
    month: monthSchema,
});

// =============================================
// HOSTEL CODE VALIDATION
// =============================================

export const hostelCodeSchema = z
    .string()
    .length(6, 'Hostel code must be 6 characters')
    .regex(/^[A-Z0-9]+$/, 'Invalid hostel code format')
    .transform((val) => val.toUpperCase());

// =============================================
// USER ROLE VALIDATION
// =============================================

export const userRoleSchema = z.enum(['student', 'owner', 'admin']);

export type UserRole = z.infer<typeof userRoleSchema>;

// =============================================
// VALIDATION HELPER
// =============================================

export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): {
    success: boolean;
    data?: T;
    error?: string;
} {
    try {
        const result = schema.parse(data);
        return { success: true, data: result };
    } catch (error) {
        if (error instanceof z.ZodError) {
            // Zod v4 uses 'issues' instead of 'errors'
            const issues = error.issues || [];
            const messages = issues.map((e) => e.message).join(', ');
            return { success: false, error: messages || 'Validation failed' };
        }
        return { success: false, error: 'Validation failed' };
    }
}
