'use client';

// Import necessary components, libraries, and hooks
import { Button } from '@/components/ui/button'; // Custom button component
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'; // Form components for better structure and validation
import { Input } from '@/components/ui/input'; // Custom input component
import { ApiResponse } from '@/types/ApiResponse'; // Type for API responses
import { zodResolver } from '@hookform/resolvers/zod'; // Zod resolver for react-hook-form validation
import axios, { AxiosError } from 'axios'; // Axios for making HTTP requests
import { useParams, useRouter } from 'next/navigation'; // Next.js hooks for navigation and route parameters
import { useForm } from 'react-hook-form'; // React Hook Form for form handling
import * as z from 'zod'; // Zod for schema validation
import { verifySchema } from '@/schemas/verifySchema'; // Validation schema for the verification form
import { useToast } from '@/hooks/use-toast'; // Custom hook for displaying toast notifications

// Main functional component for the "Verify Account" page
export default function VerifyAccount() {
    const router = useRouter(); // Router hook for navigation
    const params = useParams<{ username: string }>(); // Hook to get dynamic route parameters (e.g., username)
    const { toast } = useToast(); // Hook for triggering toast notifications

    // Initialize the form using react-hook-form and zod for schema-based validation
    const form = useForm<z.infer<typeof verifySchema>>({
        resolver: zodResolver(verifySchema), // Use Zod schema for validation
        defaultValues: {
            code: '', // Set a default value for the "code" field to avoid uncontrolled-to-controlled warnings
        },
    });

    // Form submission handler
    const onSubmit = async (data: z.infer<typeof verifySchema>) => {
        try {
            // Make a POST request to the verification API with the username and code
            const response = await axios.post<ApiResponse>(`/api/verify-code`, {
                username: params.username, // Pass the username from route params
                code: data.code, // Pass the code entered by the user
            });

            // Display success toast with the response message
            toast({
                title: 'Success',
                description: response.data.message,
            });

            // Navigate the user to the sign-in page after successful verification
            router.replace('/sign-in');
        } catch (error) {
            // Handle errors from the API
            const axiosError = error as AxiosError<ApiResponse>;

            // Display error toast with the error message or a fallback message
            toast({
                title: 'Verification Failed',
                description:
                    axiosError.response?.data.message ??
                    'An error occurred. Please try again.', // Fallback error message
                variant: 'destructive', // Use a "destructive" toast style for errors
            });
        }
    };

    // Render the verification page UI
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            {/* Centered card container for the form */}
            <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
                {/* Header section with title and instructions */}
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
                        Verify Your Account
                    </h1>
                    <p className="mb-4">Enter the verification code sent to your email</p>
                </div>
                {/* Form starts here */}
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)} // Attach the submit handler
                        className="space-y-6"
                    >
                        {/* Form field for the verification code */}
                        <FormField
                            name="code" // Name of the field
                            control={form.control} // Pass form control from react-hook-form
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Verification Code</FormLabel>
                                    {/* Input field for the code */}
                                    <Input
                                        placeholder="code" // Placeholder text
                                        {...field} // Spread field props (value, onChange, etc.)
                                        value={field.value || ''} // Ensure fallback for undefined values
                                    />
                                    <FormMessage /> {/* Displays validation errors */}
                                </FormItem>
                            )}
                        />
                        {/* Submit button */}
                        <Button type="submit">Verify</Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}
