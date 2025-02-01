/* eslint-disable react-hooks/exhaustive-deps */
'use client' // Ensures this component runs on the client-side

// Import necessary components and utilities
import MessageCard from '@/components/MessageCard' // Component for displaying individual messages
import { Button } from '@/components/ui/button' // Reusable button component
import { Separator } from '@/components/ui/separator' // UI separator for layout
import { Switch } from '@/components/ui/switch' // Toggle switch for settings
import { useToast } from '@/hooks/use-toast' // Custom toast notification hook
import { Message } from '@/model/User' // Type definition for a Message object
import { AcceptMessageSchema } from '@/schemas/acceptMessageSchema' // Validation schema for accepting messages
import { ApiResponse } from '@/types/ApiResponse' // Type definition for API responses
import { zodResolver } from '@hookform/resolvers/zod' // Resolver for integrating Zod validation with react-hook-form
import axios, { AxiosError } from 'axios' // Axios for making HTTP requests
import { Loader2, RefreshCcw } from 'lucide-react' // Icons for UI
import { User } from 'next-auth' // Type definition for NextAuth User
import { useSession } from 'next-auth/react' // Hook to get authentication session
import React, { useCallback, useEffect, useState } from 'react' // React hooks for state management
import { useForm } from 'react-hook-form' // Hook for managing forms

const Page = () => {
    // State variables for storing messages and loading states
    const [messages, setMessages] = useState<Message[]>([]); // Stores fetched messages
    const [isLoading, setIsLoading] = useState(false); // Indicates if messages are loading
    const [isSwitchLoading, setIsSwitchLoading] = useState(false); // Indicates if switch toggle is processing

    const { toast } = useToast() // Initialize toast notifications

    // Function to delete a message by filtering out the selected message ID
    const handleDeleteMessage = (messageId: string) => {
        setMessages(messages.filter((message) => message._id !== messageId))
    }

    // Get the current user session
    const { data: session } = useSession()

    // Initialize form with validation resolver
    const form = useForm({
        resolver: zodResolver(AcceptMessageSchema), // Integrating Zod schema validation
    })

    const { register, watch, setValue } = form; // Extract necessary functions from useForm

    const acceptMessages = watch('acceptMessages') // Watch state of acceptMessages toggle switch

    // Function to fetch user's message acceptance settings
    const fetchAcceptMessage = useCallback(async () => {
        setIsSwitchLoading(true) // Set loading state for switch
        try {
            const response = await axios.get<ApiResponse>('/api/accept-messages') // API call to fetch settings
            setValue('acceptMessages', response.data.isAcceptingMessages) // Update switch state
        } catch (error) {
            // Handle errors and show toast notification
            const axiosError = error as AxiosError<ApiResponse>
            toast({
                title: 'Error',
                description: axiosError.response?.data.message ?? 'Failed to fetch message settings',
                variant: 'destructive',
            })
        } finally {
            setIsSwitchLoading(false) // Reset switch loading state
        }
    }, [setValue])

    // Function to fetch messages from the backend
    const fetchMessages = useCallback(async (refresh: boolean = false) => {
        setIsLoading(true) // Set loading state
        setIsSwitchLoading(false) // Ensure switch loading state is reset
        try {
            const response = await axios.get<ApiResponse>('/api/get-messages') // API call to fetch messages
            setMessages(response.data.messages || []) // Store messages in state
            if (refresh) {
                // Show a toast notification when messages are refreshed
                toast({
                    title: 'Refreshed Messages',
                    description: 'Showing latest messages',
                });
            }
        } catch (error) {
            // Handle API errors
            const axiosError = error as AxiosError<ApiResponse>;
            toast({
                title: 'Error',
                description: axiosError.response?.data.message ?? 'Failed to fetch messages',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false); // Reset loading state
            setIsSwitchLoading(false); // Reset switch loading state
        }
    }, [setIsLoading, setMessages])

    // Fetch messages and user settings when the component mounts or session changes
    useEffect(() => {
        if (!session || !session.user) return // Do nothing if user is not logged in
        fetchMessages()
        fetchAcceptMessage()
    }, [session, setValue, fetchAcceptMessage, fetchMessages]);

    // Function to handle changes in the accept messages switch
    const handleSwitchChange = async () => {
        try {
            const response = await axios.post<ApiResponse>('/api/accept-messages', {
                acceptMessages: !acceptMessages, // Toggle the acceptMessages state
            });
            setValue('acceptMessages', !acceptMessages); // Update the switch state
            toast({
                title: response.data.message,
                variant: 'default',
            });
        } catch (error) {
            // Handle API errors
            const axiosError = error as AxiosError<ApiResponse>;
            toast({
                title: 'Error',
                description: axiosError.response?.data.message ?? 'Failed to update message settings',
                variant: 'destructive',
            });
        }
    }

    // Extract username from session user
    const { username } = session?.user as User
    // Construct user's profile URL dynamically based on the current domain
    const baseUrl = `${window.location.protocol}//${window.location.host}`
    const profileUrl = `${baseUrl}/u/${username}`;

    // Function to copy the user's profile URL to clipboard
    const copyToClipboard = () => {
        navigator.clipboard.writeText(profileUrl); // Copy URL to clipboard
        toast({
            title: 'URL Copied!',
            description: 'Profile URL has been copied to clipboard.',
        });
    };

    // If user is not logged in, show a message instead of the dashboard
    if (!session || !session.user) {
        return (
            <div>
                You need to be logged in to view this page
            </div>
        )
    }

    // Main JSX layout of the dashboard
    return (
        <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
            <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

            {/* Section for copying unique profile link */}
            <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>
                <div className="flex items-center">
                    <input
                        type="text"
                        value={profileUrl}
                        disabled
                        className="input input-bordered w-full p-2 mr-2"
                    />
                    <Button onClick={copyToClipboard}>Copy</Button>
                </div>
            </div>

            {/* Switch to toggle message acceptance */}
            <div className="mb-4">
                <Switch
                    {...register('acceptMessages')}
                    checked={acceptMessages}
                    onCheckedChange={handleSwitchChange}
                    disabled={isSwitchLoading}
                />
                <span className="ml-2">
                    Accept Messages: {acceptMessages ? 'On' : 'Off'}
                </span>
            </div>
            <Separator /> {/* UI separator */}

            {/* Refresh messages button */}
            <Button
                className="mt-4"
                variant="outline"
                onClick={(e) => {
                    e.preventDefault();
                    fetchMessages(true);
                }}
            >
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <RefreshCcw className="h-4 w-4" />
                )}
            </Button>

            {/* Display messages */}
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                {messages.length > 0 ? (
                    messages.map((message) => (
                        <MessageCard
                            key={message._id as string}
                            message={message}
                            onMessageDelete={handleDeleteMessage}
                        />
                    ))
                ) : (
                    <p>No messages to display.</p>
                )}
            </div>
        </div>
    );
}

export default Page
