import dbConnect from "@/lib/dbConnect"; // Function to establish a connection with the database
import UserModel from "@/model/User"; // Mongoose model for interacting with the User collection
import bcrypt from "bcryptjs"; // Library for hashing passwords
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail"; // Helper function to send verification emails

export async function POST(request: Request) {
    // Connect to the database
    await dbConnect();

    try {
        // Parse the incoming request body for user data
        const { username, email, password } = await request.json();

        // Check if a verified user already exists with the same username
        const existingUserVerifiedByUsername = await UserModel.findOne({
            username,
            isVerified: true, // Ensure we check only for verified users
        });

        // If a verified user exists with the same username, return an error
        if (existingUserVerifiedByUsername) {
            return Response.json(
                {
                    success: false,
                    message: "Username is already taken",
                },
                { status: 400 } // Bad request
            );
        }

        // Check if an account already exists with the given email
        const existingUserByEmail = await UserModel.findOne({ email });
        // Generate a 6-digit random verification code
        const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

        if (existingUserByEmail) {
            // If the email is already associated with a verified account, return an error
            if (existingUserByEmail.isVerified) {
                return Response.json(
                    {
                        success: false,
                        message: "User already exists with this email",
                    },
                    { status: 400 } // Bad request
                );
            } else {
                // If the user exists but is not verified, update their account
                const hashedPassword = await bcrypt.hash(password, 10); // Hash the new password
                existingUserByEmail.password = hashedPassword; // Update password
                existingUserByEmail.verifyCode = verifyCode; // Update verification code
                existingUserByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000); // Set expiry to 1 hour from now
                await existingUserByEmail.save(); // Save the updated user document
            }
        } else {
            // If no user exists with the provided email, create a new user
            const hashedPassword = await bcrypt.hash(password, 10); // Hash the password for security
            const expiryDate = new Date();
            expiryDate.setHours(expiryDate.getHours() + 1); // Set verification code expiry to 1 hour

            const newUser = new UserModel({
                username,
                email,
                password: hashedPassword,
                verifyCode,
                verifyCodeExpiry: expiryDate,
                isVerified: false, // New users start as unverified
                isAcceptingMessages: true, // Default setting for message preferences
                messages: [], // Initialize an empty array for user messages
            });

            // Save the new user to the database
            await newUser.save();

            // Send a verification email to the user
            const emailResponse = await sendVerificationEmail(
                email,
                username,
                verifyCode
            );

            // Handle cases where the email could not be sent
            if (!emailResponse.success) {
                return Response.json(
                    {
                        success: false,
                        message: emailResponse.message,
                    },
                    { status: 500 } // Internal server error
                );
            }

            // Successfully registered user and email sent
            return Response.json(
                {
                    success: true,
                    message: "User registered successfully. Please verify your email",
                },
                { status: 201 } // Created
            );
        }
    } catch (error) {
        // Catch and log any errors during the process
        console.error("Error registering user", error);
        return Response.json(
            {
                success: false,
                message: "Error registering user",
            },
            { status: 500 } // Internal server error
        );
    }
}
