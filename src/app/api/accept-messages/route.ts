/* eslint-disable @typescript-eslint/no-unused-vars */

// Import required modules and functions
import { getServerSession } from 'next-auth/next'; // For authentication sessions
import { authOptions } from '../auth/[...nextauth]/options'; // NextAuth options for session management
import dbConnect from '@/lib/dbConnect'; // Utility to establish a database connection
import UserModel from '@/model/User'; // Mongoose User model
import { User } from 'next-auth'; // Type definition for NextAuth User

// Handler for the POST request to update the user's message acceptance status
export async function POST(request: Request) {
    // Connect to the database
    await dbConnect();

    // Retrieve the user's session
    const session = await getServerSession(authOptions);

    // Typecast the session user to the User type
    const user: User = session?.user as User;

    // Check if the session or user is missing (unauthenticated)
    if (!session || !session.user) {
        return Response.json(
            { success: false, message: 'Not authenticated' },
            { status: 401 } // Unauthorized status code
        );
    }

    // Extract the user's ID from the session
    const userId = user._id;

    // Parse the request body to get the `acceptMessages` field
    const { acceptMessages } = await request.json();

    try {
        // Update the user's `isAcceptingMessages` field in the database
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId, // Find user by ID
            { isAcceptingMessages: acceptMessages }, // Update field
            { new: true } // Return the updated document
        );

        // If no user is found with the given ID, return a 404 error
        if (!updatedUser) {
            return Response.json(
                {
                    success: false,
                    message: 'Unable to find user to update message acceptance status',
                },
                { status: 404 } // Not found status code
            );
        }

        // Respond with success if the update was successful
        return Response.json(
            {
                success: true,
                message: 'Message acceptance status updated successfully',
                updatedUser, // Return updated user details
            },
            { status: 200 } // OK status code
        );
    } catch (error) {
        // Log and return a 500 error if something goes wrong
        console.error('Error updating message acceptance status:', error);
        return Response.json(
            { success: false, message: 'Error updating message acceptance status' },
            { status: 500 } // Internal server error status code
        );
    }
}

// Handler for the GET request to retrieve the user's message acceptance status
export async function GET(request: Request) {
    // Connect to the database
    await dbConnect();

    // Retrieve the user's session
    const session = await getServerSession(authOptions);

    // Extract the user object from the session
    const user = session?.user;

    // Check if the session or user is missing (unauthenticated)
    if (!session || !user) {
        return Response.json(
            { success: false, message: 'Not authenticated' },
            { status: 401 } // Unauthorized status code
        );
    }

    try {
        // Find the user in the database using their ID
        const foundUser = await UserModel.findById(user._id);

        // If no user is found, return a 404 error
        if (!foundUser) {
            return Response.json(
                { success: false, message: 'User not found' },
                { status: 404 } // Not found status code
            );
        }

        // Respond with the user's message acceptance status
        return Response.json(
            {
                success: true,
                isAcceptingMessages: foundUser.isAcceptingMessages, // Return the field value
            },
            { status: 200 } // OK status code
        );
    } catch (error) {
        // Log and return a 500 error if something goes wrong
        console.error('Error retrieving message acceptance status:', error);
        return Response.json(
            { success: false, message: 'Error retrieving message acceptance status' },
            { status: 500 } // Internal server error status code
        );
    }
}
