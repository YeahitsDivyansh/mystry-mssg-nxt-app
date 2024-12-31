// Import NextAuth and its DefaultSession type to extend the built-in types
import 'next-auth';
import { DefaultSession } from 'next-auth';

// Extend the default NextAuth types for User and Session
declare module 'next-auth' {
    // Extend the User interface to include custom fields
    interface User {
        _id?: string; // The unique identifier for the user in the database
        isVerfied?: boolean; // Indicates whether the user's account is verified
        isAcceptingMessages?: boolean; // Custom field to track if the user allows messaging
        username?: string; // The username for the user
    }

    // Extend the Session interface to include custom user fields
    interface Session {
        user: {
            _id?: string; // Include the user's ID in the session object
            isVerfied?: boolean; // Include the verification status in the session
            isAcceptingMessages?: boolean; // Include the message preference in the session
            username?: string; // Include the username in the session
        } & DefaultSession['user']; // Keep all default session fields (e.g., email, name)
    }
}

// Extend the JWT interface for additional fields in the JSON Web Token
declare module 'next-auth/jwt' {
    interface JWT {
        _id?: string; // Include the user's ID in the token for server-side use
        isVerified?: boolean; // Track verification status in the token
        isAcceptingMessages?: boolean; // Track message preferences in the token
        username?: string; // Include the username in the token
    }
}
