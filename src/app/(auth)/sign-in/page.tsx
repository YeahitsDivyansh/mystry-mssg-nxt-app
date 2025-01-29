'use client'; // Ensures this component runs on the client side (Next.js feature)

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { signIn } from 'next-auth/react';
import { Form, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInSchema } from '@/schemas/signInSchema'; // Importing validation schema for sign-in
import { useToast } from '@/hooks/use-toast'; // Custom hook to show toast notifications

export default function SignInForm() {
  const router = useRouter(); // Hook for navigation (Next.js)

  // Initializing React Hook Form with Zod validation schema
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema), // Uses Zod schema for validation
    defaultValues: {
      identifier: '', // Email or username input field
      password: '',   // Password input field
    },
  });

  const { toast } = useToast(); // Function to show toast notifications

  // Function to handle form submission
  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    // Attempt to sign in using NextAuth.js with 'credentials' provider
    const result = await signIn('credentials', {
      redirect: false, // Prevent automatic redirection
      identifier: data.identifier, // Send email/username to backend
      password: data.password, // Send password to backend
    });

    // If authentication fails, show error messages using toast notifications
    if (result?.error) {
      if (result.error === 'CredentialsSignin') {
        toast({
          title: 'Login Failed',
          description: 'Incorrect username or password',
          variant: 'destructive', // Shows a red error toast
        });
      } else {
        toast({
          title: 'Error',
          description: result.error, // Show other types of errors
          variant: 'destructive',
        });
      }
    }

    // If authentication is successful, redirect user to the dashboard
    if (result?.url) {
      router.replace('/dashboard');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-800">
      {/* Wrapper for the form card */}
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        {/* Header Section */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
            Welcome Back to True Feedback
          </h1>
          <p className="mb-4">Sign in to continue your secret conversations</p>
        </div>

        {/* React Hook Form wrapper providing context */}
        <Form {...form}>
          {/* The actual form element */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Email/Username Input Field */}
            <FormField
              name="identifier"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email/Username</FormLabel>
                  <Input placeholder="email/username" {...field} />
                  <FormMessage /> {/* Displays validation error messages */}
                </FormItem>
              )}
            />

            {/* Password Input Field */}
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <Input type="password" {...field} />
                  <FormMessage /> {/* Displays validation error messages */}
                </FormItem>
              )}
            />

            {/* Submit Button (Triggers form submission) */}
            <Button className="w-full" type="submit">Sign In</Button>
          </form>
        </Form>

        {/* Signup Link */}
        <div className="text-center mt-4">
          <p>
            Not a member yet?{' '}
            <Link href="/sign-up" className="text-blue-600 hover:text-blue-800">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
