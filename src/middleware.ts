import { NextRequest, NextResponse } from 'next/server'; // Import request and response utilities for middleware
export { default } from 'next-auth/middleware'; // Use default NextAuth middleware functionality
import { getToken } from 'next-auth/jwt'; // Import function to extract the JWT token from the request

// Custom middleware function
export async function middleware(request: NextRequest) {
    const token = await getToken({ req: request }); // Retrieve the token from the request
    const url = request.nextUrl; // Extract the URL object from the request for easier access

    // Check if the user is authenticated and accessing public or restricted routes
    if (token &&
        (
            url.pathname.startsWith('/sign-in') || // Redirect authenticated users from sign-in
            url.pathname.startsWith('/sign-up') || // Redirect authenticated users from sign-up
            url.pathname.startsWith('/verify') || // Redirect authenticated users from verify
            url.pathname.startsWith('/') // Redirect authenticated users from the home page
        )
    ) {
        // Redirect to the dashboard if authenticated
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Check if the user is unauthenticated and trying to access protected routes
    if (!token && url.pathname.startsWith('/dashboard')) {
        // Redirect unauthenticated users to the sign-in page
        return NextResponse.redirect(new URL('/sign-in', request.url));
    }

    // Allow the request to continue for all other scenarios
    return NextResponse.next();
}

// Define route patterns that should trigger this middleware
export const config = {
    matcher: [
        '/sign-in',         // Match the sign-in route
        '/sign-up',         // Match the sign-up route
        '/',                // Match the home page
        '/dashboard/:path*',// Match the dashboard and its sub-routes
        '/verify/:path*'    // Match the verify page and its sub-routes
    ]
};
