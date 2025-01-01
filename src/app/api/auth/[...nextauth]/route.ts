// Import the core NextAuth function
import NextAuth from "next-auth/next";

// Import the authentication configuration options
// This file typically contains provider configurations, callbacks, and other settings
import { authOptions } from "./options";

// Create an API route handler for NextAuth using the provided options
const handler = NextAuth(authOptions);

// Export the handler to support both GET and POST HTTP methods
// GET: Used for retrieving session data or rendering the sign-in page
// POST: Used for authentication actions like signing in or signing out
export { handler as GET, handler as POST };
