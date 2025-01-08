import dbConnect from "@/lib/dbConnect"; // Import database connection utility
import UserModel from "@/model/User";   // Import the User model to interact with the database

// Define the POST function to handle user verification requests
export async function POST(request: Request) {
    // Establish a connection to the database
    await dbConnect();

    try {
        // Extract the username and code (OTP) from the incoming request body
        const { username, code } = await request.json();

        // Decode the username in case it contains URL-encoded characters
        const decodedUsername = decodeURIComponent(username);

        // Find the user in the database using the decoded username
        const user = await UserModel.findOne({ username: decodedUsername });

        // If no user is found, return an error response
        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: "User not found", // Error message for client
                },
                { status: 500 } // HTTP status code for internal server error
            );
        }

        // Check if the provided code matches the stored verifyCode
        const isCodeValid = user.verifyCode === code;

        // Check if the verification code is still within its validity period
        const isCodeNotExpired = new Date(user.verifyCodeExpiry) > new Date();

        // If the code is valid and not expired, mark the account as verified
        if (isCodeValid && isCodeNotExpired) {
            user.isVerified = true; // Set the user's `isVerified` status to true
            await user.save();      // Save the updated user record in the database

            // Return a success response
            return Response.json(
                {
                    success: true,
                    message: "Account verified successfully",
                },
                { status: 200 } // HTTP status code for success
            );
        } else if (!isCodeNotExpired) {
            // If the code has expired, inform the client
            return Response.json(
                {
                    success: false,
                    message: "Verification code has expired. Please sign up again to get a new code.",
                },
                { status: 400 } // HTTP status code for bad request
            );
        } else {
            // If the code is invalid, inform the client
            return Response.json(
                {
                    success: false,
                    message: "Incorrect verification code"
                },
                { status: 400 } // HTTP status code for bad request
            );
        }
    } catch (error) {
        // Handle any unexpected errors that occur during processing
        console.error("Error verifying user", error); // Log the error for debugging purposes
        return Response.json(
            {
                success: false,
                message: "Error verifying user", // Generic error message for the client
            },
            { status: 500 } // HTTP status code for internal server error
        );
    }
}
