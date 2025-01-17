/* eslint-disable @typescript-eslint/no-explicit-any */
import { GoogleGenerativeAI } from "@google/generative-ai";  // Import GEMINI API package
import { NextResponse } from "next/server";  // Import Next.js response handling

export async function POST(req: Request) {
    try {
        // Parse the incoming JSON request to extract any data (e.g., messages)
        const { messages } = await req.json(); // Assuming the client sends 'messages' in the request payload

        // Ensure that the GEMINI API key is set in environment variables
        const apiKey = process.env.GEMINI_API_KEY as string;  // Retrieve API key from environment variables
        if (!apiKey) {
            // If API key is not found, return an error response
            return NextResponse.json(
                { error: "GEMINI_API_KEY is not set in environment variables." },
                { status: 500 }
            );
        }

        // Initialize GEMINI API client with the API key
        const genAI = new GoogleGenerativeAI(apiKey);

        // Define the model to be used for text generation (text-bison-001 is appropriate for general text generation)
        const model = genAI.getGenerativeModel({
            model: "models/text-bison-001",  // This is a pre-trained model from GEMINI for generating text
        });

        // Define the configuration for text generation
        const generationConfig = {
            temperature: 1,  // Controls the randomness of the output (higher values = more randomness)
            topP: 0.95,  // Nucleus sampling parameter that controls the diversity of the output
            topK: 40,  // Limits the sampling to the top K possibilities
            maxOutputTokens: 8192,  // The maximum number of tokens (words/phrases) in the generated response
            responseMimeType: "text/plain",  // Set the response type as plain text
        };

        // Start a chat session with GEMINI using the provided generation configuration
        // The 'history' parameter is used to keep track of the previous chat context, which helps generate relevant responses
        const response = model.startChat({
            generationConfig,
            history: messages || [],  // If there are no previous messages, initialize an empty array
        });

        // Define a prompt that guides GEMINI to generate open-ended and engaging questions
        const prompt =
            "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";

        // Send the prompt to the model and await the generated response
        const result = await response.sendMessage(prompt);

        // Extract the generated text from the response
        const responseText = result.response.text() as string;

        // Return the generated questions as a JSON response
        // This will be sent back to the client for use in the mystery messenger app
        return NextResponse.json({ suggestions: responseText }, { status: 200 });
    } catch (error: any) {
        // If an error occurs during any step, handle it gracefully and return a meaningful error response
        if (error) {
            // Destructure the error to provide specific details in the response
            const { name, status, headers, message } = error;
            return NextResponse.json({ name, status, headers, message }, { status });
        } else {
            // Log the error for debugging purposes and re-throw if it's not caught
            console.log('An unexpected error occurred:', error);
            throw error;
        }
    }
}
