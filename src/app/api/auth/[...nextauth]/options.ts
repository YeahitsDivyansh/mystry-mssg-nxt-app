/* eslint-disable @typescript-eslint/no-explicit-any */
// Disable TypeScript linting for explicit `any` usage, but try to avoid `any` for better type safety.

import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";

// Export the NextAuth configuration options
export const authOptions: NextAuthOptions = {
    // Configure authentication providers
    providers: [
        CredentialsProvider({
            id: "credentials", // Unique identifier for this provider
            name: "Credentials", // Name displayed for this provider in UI
            credentials: {
                // Define expected credentials (input fields for email and password)
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" }
            },
            // The `authorize` method handles user authentication
            async authorize(credentials: any): Promise<any> {
                await dbConnect(); // Connect to the database
                try {
                    // Find a user in the database using email or username
                    const user = await UserModel.findOne({
                        $or: [
                            { email: credentials.identifier }, // Match by email
                            { username: credentials.identifier } // Match by username
                        ]
                    });

                    // If no user is found, throw an error
                    if (!user) {
                        throw new Error("No user found with this email");
                    }

                    // Check if the user account is verified
                    if (!user.isVerified) {
                        throw new Error("Please verify your account before login");
                    }

                    // Verify the password using bcrypt
                    const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
                    if (isPasswordCorrect) {
                        return user; // Return the user object if credentials are valid
                    } else {
                        throw new Error("Incorrect Password");
                    }
                } catch (err: any) {
                    throw new Error(err); // Handle and rethrow errors
                }
            }
        })
    ],
    // Define callback functions to customize JWT and session handling
    callbacks: {
        // The `jwt` callback is triggered when a JWT is created or updated
        async jwt({ token, user }) {
            if (user) {
                token._id = user._id?.toString(); // Add the user ID to the token
                token.isVerified = user.isVerfied; // Add verification status to the token
                token.isAcceptingMessages = user.isAcceptingMessages; // Add message preference to the token
                token.username = user.username; // Add the username to the token
            }
            return token; // Return the updated token
        },
        // The `session` callback is triggered when a session is created or accessed
        async session({ session, token }) {
            if (token) {
                session.user._id = token._id; // Add the user ID to the session
                session.user.isVerfied = token.isVerified; // Add verification status to the session
                session.user.isAcceptingMessages = token.isAcceptingMessages; // Add message preference to the session
                session.user.username = token.username; // Add the username to the session
            }
            return session; // Return the updated session
        }
    },
    // Define custom pages for authentication
    pages: {
        signIn: '/sign-in' // Path to the sign-in page
    },
    // Specify the session strategy
    session: {
        strategy: "jwt" // Use JSON Web Tokens (JWT) to manage sessions
    },
    // Set the secret used for signing JWTs (must be set in the environment variables)
    secret: process.env.NEXTAUTH_SECRET
};
