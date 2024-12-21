import mongoose from "mongoose";

// Define a type for the connection object, which will hold the connection state
type ConnectionObject = {
    isConnected?: number; // Optional property to track the database connection state
}

// Create a connection object to manage the connection status
const connection: ConnectionObject = {};

// Define an asynchronous function to connect to the MongoDB database
async function dbConnect(): Promise<void> {
    // Check if already connected to the database
    if (connection.isConnected) {
        console.log("Already connected to database"); // Log a message if the connection is active
        return; // Exit the function early as there's no need to reconnect
    }

    try {
        // Attempt to connect to the database using the Mongoose connect method
        const db = await mongoose.connect(process.env.MONGODB_URI || '', {});
        // `process.env.MONGODB_URI`: The connection string for MongoDB from environment variables
        // The second argument is an empty options object (can be customized for configurations)

        // Update the connection object to track the connection state
        connection.isConnected = db.connections[0].readyState;
        // `readyState` is a Mongoose property indicating connection status:
        // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting

        console.log("DB Connected Successfully"); // Log success message
    } catch (error) {
        // Handle connection errors and log the failure message
        console.log("Database connection failed", error);
        process.exit(1); // Exit the process with a failure code (1)
    }
}

// Export the dbConnect function so it can be imported and used elsewhere in the application
export default dbConnect;
