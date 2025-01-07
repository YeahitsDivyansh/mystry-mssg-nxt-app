import dbConnect from '@/lib/dbConnect'; // Import database connection utility
import UserModel from '@/model/User'; // Import the user model
import { z } from 'zod'; // Import Zod for schema validation
import { usernameValidation } from '@/schemas/signUpSchema'; // Import username validation schema

// Define schema for validating the username query parameter
const UsernameQuerySchema = z.object({
    username: usernameValidation, // Username must adhere to the predefined validation rules
});

export async function GET(request: Request) {
    await dbConnect(); // Establish a database connection

    try {
        const { searchParams } = new URL(request.url); // Extract query parameters from the request URL
        const queryParams = {
            username: searchParams.get('username'), // Get the username query parameter
        };

        // Validate the query parameters using the schema
        const result = UsernameQuerySchema.safeParse(queryParams);

        if (!result.success) {
            // Extract and format validation errors
            const usernameErrors = result.error.format().username?._errors || [];
            return Response.json(
                {
                    success: false, // Indicate validation failure
                    message:
                        usernameErrors?.length > 0
                            ? usernameErrors.join(', ') // Combine errors into a single message
                            : 'Invalid query parameters',
                },
                { status: 400 } // Bad Request
            );
        }

        const { username } = result.data; // Destructure validated data

        // Check if a verified user with the same username exists in the database
        const existingVerifiedUser = await UserModel.findOne({
            username,
            isVerified: true, // Only check for verified users
        });

        if (existingVerifiedUser) {
            // Username is already taken
            return Response.json(
                {
                    success: false,
                    message: 'Username is already taken',
                },
                { status: 200 } // OK, but username is unavailable
            );
        }

        // Username is unique
        return Response.json(
            {
                success: true,
                message: 'Username is unique',
            },
            { status: 200 } // OK
        );
    } catch (error) {
        console.error('Error checking username:', error); // Log the error for debugging
        return Response.json(
            {
                success: false, // Indicate a server-side error
                message: 'Error checking username',
            },
            { status: 500 } // Internal Server Error
        );
    }
}
