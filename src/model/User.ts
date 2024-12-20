import mongoose, { Schema, Document } from "mongoose";

// Define the Message interface, which represents a message document in the database
export interface Message extends Document {
    content: string;  // Content of the message (text)
    createdAt: Date;  // Timestamp when the message was created
}

// Create a schema for the Message model, defining its structure
const MessageSchema: Schema<Message> = new mongoose.Schema({
    content: {
        type: String,  // Content of the message is a string
        required: true  // The content is mandatory
    },
    createdAt: {
        type: Date,  // The creation date is a Date type
        required: true,  // Creation date is mandatory
        default: Date.now  // Default value for createdAt is the current date and time
    }
});

// Define the User interface, which represents a user document in the database
export interface User extends Document {
    username: string;  // The user's username
    email: string;  // The user's email address
    password: string;  // The user's hashed password
    verifyCode: string;  // The verification code sent to the user
    verifyCodeExpiry: Date;  // The expiration date of the verification code
    isVerified: boolean;  // Boolean flag indicating whether the user is verified
    isAcceptingMessages: boolean;  // Flag to check if the user is accepting messages
    messages: Message[];  // Array of messages the user has received (messages are stored as Message objects)
}

// Create a schema for the User model, defining its structure and validation rules
const UserSchema: Schema<User> = new mongoose.Schema({
    username: {
        type: String,  // Username is a string
        required: [true, 'Username is required'],  // Username is mandatory
        trim: true,  // Remove extra spaces around the username
        unique: true,  // Ensure the username is unique across all users
    },
    email: {
        type: String,  // Email is a string
        required: [true, 'Email is required'],  // Email is mandatory
        unique: true,  // Ensure the email is unique across all users
        match: [/.+\@.+\..+/, 'Please use a valid email address'],  // Regex validation for a valid email format
    },
    password: {
        type: String,  // Password is a string
        required: [true, 'Password is required'],  // Password is mandatory
    },
    verifyCode: {
        type: String,  // Verification code is a string
        required: [true, 'Verify Code is required'],  // Verification code is mandatory
    },
    verifyCodeExpiry: {
        type: Date,  // Verification code expiration date is a Date
        required: [true, 'Verify Code Expiry is required'],  // Expiry is mandatory
    },
    isVerified: {
        type: Boolean,  // Verification status is a Boolean
        default: false,  // Default value is false (user is not verified initially)
    },
    isAcceptingMessages: {
        type: Boolean,  // Flag indicating if the user is accepting messages
        default: true,  // Default value is true (user is accepting messages by default)
    },
    messages: [MessageSchema],  // Array of messages, using the MessageSchema to define message structure
});

// Check if the User model is already defined in Mongoose (to avoid re-registering it)
// If it exists, use the existing model, otherwise create a new one
const UserModel = (mongoose.models.User as mongoose.Model<User>)
    || mongoose.model<User>('User', UserSchema);

// Export the UserModel to make it available for use elsewhere in the application
export default UserModel;
