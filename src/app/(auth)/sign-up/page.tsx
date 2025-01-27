"use client"; // Indicates this is a client-side rendered component (specific to Next.js).

import { zodResolver } from "@hookform/resolvers/zod"; // Allows integration of zod validation with react-hook-form.
import { useForm } from "react-hook-form"; // Library for managing forms.
import * as z from "zod"; // Library for schema-based validation.
import Link from "next/link"; // Used for client-side navigation in Next.js.
import { useState, useEffect } from "react"; // React hooks for managing state and lifecycle.
import { useDebounceCallback } from 'usehooks-ts'; // Hook to debounce a function to avoid excessive execution.
import { useToast } from "@/hooks/use-toast"; // Custom hook for displaying toast notifications.
import { useRouter } from "next/navigation"; // Next.js hook for client-side navigation.
import { signUpSchema } from "@/schemas/signUpSchema"; // Zod schema for form validation.
import axios, { AxiosError } from "axios"; // HTTP client for making API requests.
import { ApiResponse } from "@/types/ApiResponse"; // Type for consistent API response structure.
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form"; // UI components for managing forms.
import { Input } from "@/components/ui/input"; // Input component for form fields.
import { Button } from "@/components/ui/button"; // Button component with styles.
import { Loader2 } from "lucide-react"; // Icon used as a loading spinner.

const Page = () => {
    // State for tracking the username input value.
    const [username, setUsername] = useState('');

    // State for displaying messages about username validation (e.g., uniqueness).
    const [usernameMessage, setUsernameMessage] = useState('');

    // State to indicate if the username uniqueness check is in progress.
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);

    // State to indicate if the form is being submitted.
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Debounced function to delay setting the username to avoid excessive API calls.
    const debounced = useDebounceCallback(setUsername, 300);

    // Toast hook for showing notifications.
    const { toast } = useToast();

    // Router hook for programmatic navigation.
    const router = useRouter();

    // Setting up react-hook-form with zod schema for validation.
    const form = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema), // Use zod schema for form validation.
        defaultValues: { // Initial values for the form fields.
            username: '',
            email: '',
            password: ''
        }
    });

    // useEffect to check username uniqueness whenever the username state changes.
    useEffect(() => {
        const checkUsernameUnique = async () => {
            // Only perform the check if a username is provided.
            if (username) {
                setIsCheckingUsername(true); // Set loading state.
                setUsernameMessage(''); // Clear previous messages.
                try {
                    // API call to check if the username is unique.
                    const response = await axios.get(`/api/check-username-unique?username=${username}`);
                    setUsernameMessage(response?.data.message); // Set success or failure message.
                } catch (error) {
                    // Handle API errors gracefully.
                    const axiosError = error as AxiosError<ApiResponse>;
                    setUsernameMessage(
                        axiosError.response?.data.message ?? "Error checking username"
                    );
                } finally {
                    setIsCheckingUsername(false); // Reset loading state.
                }
            }
        };

        // Call the async function.
        checkUsernameUnique();
    }, [username]); // Dependency array ensures this runs when `username` changes.

    // Function to handle form submission.
    const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
        setIsSubmitting(true); // Set submitting state.
        try {
            // API call to submit the signup form data.
            const response = await axios.post<ApiResponse>('/api/sign-up', data);

            // Show a success toast notification.
            toast({
                title: 'Success',
                description: response.data.message
            });

            // Redirect to the verification page for the username.
            router.replace(`/verify/${username}`);
            setIsSubmitting(false); // Reset submitting state.
        } catch (error) {
            // Log and handle errors during signup.
            console.log("Error in signup of user", error);
            const axiosError = error as AxiosError<ApiResponse>;
            const errorMessage = axiosError.response?.data.message;

            // Show a failure toast notification.
            toast({
                title: "Signup failed",
                description: errorMessage,
                variant: "destructive"
            });
            setIsSubmitting(false); // Reset submitting state.
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-800">
            {/* Center the form container on the page with a dark background. */}
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                <div className="text-center">
                    {/* Header for the signup form. */}
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
                        Join Mystery Message
                    </h1>
                    <p className="mb-4">Sign up to start your anonymous adventure</p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        {/* Username field with validation and debounced API calls for uniqueness check. */}
                        <FormField
                            name="username"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="username"
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(e); // Update react-hook-form state.
                                                debounced(e.target.value); // Debounced update for username state.
                                            }}
                                        />
                                    </FormControl>
                                    {/* Show loader while checking username uniqueness. */}
                                    {isCheckingUsername && <Loader2 className="animate-spin" />}
                                    {/* Display validation message for the username. */}
                                    <p className={`text-sm ${usernameMessage === "Username is unique" ? 'text-green-500' : 'text-red-500'}`}>
                                        {usernameMessage}
                                    </p>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {/* Email field. */}
                        <FormField
                            name="email"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="email"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {/* Password field. */}
                        <FormField
                            name="password"
                            control={form.control}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="password"
                                            placeholder="password"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {/* Submit button with loading spinner during form submission. */}
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Please wait
                                </>
                            ) : ('Signup')}
                        </Button>
                    </form>
                </Form>
                {/* Link to the sign-in page for existing users. */}
                <div className="text-center mt-4">
                    <p>
                        Already a member?{' '}
                        <Link href="/sign-in" className="text-blue-600 hover:text-blue-800">
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Page;
