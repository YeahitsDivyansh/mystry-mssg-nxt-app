import { z } from 'zod';

// Validation schema for a username
// - Must be a string
// - Must have a minimum length of 2 characters
// - Must have a maximum length of 20 characters
// - Must only contain alphanumeric characters and underscores (no special characters)
export const usernameValidation = z
    .string()
    .min(2, 'Username must be at least 2 characters') // Minimum length validation
    .max(20, 'Username must be at no more than 20 characters') // Maximum length validation
    .regex(/^[a-zA-Z0-9_]+$/, 'Username must not contain special characters'); // Pattern validation

// Schema for validating sign-up form data
// - Includes validation for username, email, and password
export const signUpSchema = z.object({
    // Username validation based on the previously defined schema
    username: usernameValidation,
    // Email validation
    // - Must be a valid email format
    // - Custom error message for invalid email
    email: z.string().email({ message: 'Invalid email address' }),
    // Password validation
    // - Must be a string
    // - Minimum length of 6 characters
    // - Custom error message for insufficient length
    password: z.string().min(6, { message: 'Password must be at least 6 characters' })
});
