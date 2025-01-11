/* eslint-disable @typescript-eslint/no-unused-vars */
import dbConnect from '@/lib/dbConnect'; // Utility to connect to the MongoDB database
import UserModel from '@/model/User'; // Mongoose model for the User collection
import { User } from 'next-auth'; // Type definition for User from next-auth
import { getServerSession } from 'next-auth/next'; // Function to retrieve user session
import { authOptions } from '../auth/[...nextauth]/options'; // Configuration for NextAuth
import mongoose from 'mongoose'; // Mongoose library for working with MongoDB

// Handler for GET requests to retrieve user messages
export async function GET(request: Request) {
    // Connect to the MongoDB database
    await dbConnect();

    // Retrieve the user's session
    const session = await getServerSession(authOptions);

    // Extract the user object from the session and cast it to the `User` type
    const user: User = session?.user as User;

    // If there is no session or user, return a 401 Unauthorized response
    if (!session || !user) {
        return Response.json(
            { success: false, message: 'Not authenticated' },
            { status: 401 }
        );
    }

    // Convert the user's ID (string) into a MongoDB ObjectId
    const userId = new mongoose.Types.ObjectId(user._id);

    try {
        // Use MongoDB's aggregation pipeline to retrieve and process the user's messages
        const user = await UserModel.aggregate([
            { $match: { id: userId } }, // Match the user document with the provided ID
            { $unwind: '$messages' }, // Deconstruct the `messages` array into individual documents
            { $sort: { 'messages.createdAt': -1 } }, // Sort the messages by creation date (descending)
            {
                $group: { // Group the processed documents back into the original structure
                    _id: '$_id', // Group by the user's ID
                    messages: { $push: '$messages' } // Reconstruct the `messages` array
                }
            }
        ]);

        // If the user or their messages are not found, return a 404 Not Found response
        if (!user || user.length === 0) {
            return Response.json(
                { message: 'User not found', success: false },
                { status: 404 }
            );
        }

        // Return the sorted messages array as a successful response
        return Response.json(
            { messages: user[0].messages }, // Aggregation result's first (and only) entry
            { status: 200 }
        );
    } catch (error) {
        // Log any errors that occur during execution
        console.error('An unexpected error occurred:', error);

        // Return a 500 Internal Server Error response with an error message
        return Response.json(
            { message: 'Internal server error', success: false },
            { status: 500 }
        );
    }
}
