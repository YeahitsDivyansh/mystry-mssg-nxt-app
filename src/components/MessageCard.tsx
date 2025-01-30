'use client'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import React from 'react'
import { useToast } from "@/hooks/use-toast"
import axios from "axios"
import { ApiResponse } from "@/types/ApiResponse"

type MessageCardProps = {
    message: Message;
    onMessageDelete: (messageId: string) => void
}

type Message = {
    _id: string;
    // other properties
};

const MessageCard = ({ message, onMessageDelete }: MessageCardProps) => {
    const { toast } = useToast()
    const handleDeleteConfirm = async () => {
        const response = await axios.delete<ApiResponse>(`/api/delete-message/${message._id}`);
        toast({
            title: response.data.message,
        });
        onMessageDelete(message._id);
    }
    return (
        <Card>
            <CardHeader>
                <CardTitle>Card Title</CardTitle>
                <AlertDialog>
                    <AlertDialogTrigger>Open</AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete
                                this message.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteConfirm}>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                <CardDescription>Card Description</CardDescription>
            </CardHeader>
            <CardContent>
            </CardContent>
        </Card>

    )
}

export default MessageCard
