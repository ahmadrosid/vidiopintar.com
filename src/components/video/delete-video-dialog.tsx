"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useDeleteVideoDialogStore } from '@/lib/store/dialog-store'
import { handleDeleteVideo } from "@/app/actions"
import { useActionState, useEffect } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";

function DeleteButton() {
    const { pending } = useFormStatus();
    
    return (
        <Button type="submit" disabled={pending} className="cursor-pointer">
            {pending ? <Loader className="size-4 animate-spin" /> : "Yes, delete!"}
        </Button>
    );
}

export function DeleteVideoDialog() {
    const { isOpen, closeDialog, id } = useDeleteVideoDialogStore()
    const [state, formAction] = useActionState(handleDeleteVideo, { success: false, errors: undefined });

    useEffect(() => {
        if (state.success) {
            closeDialog();
        }
    }, [state, closeDialog]);
    
    return (
        <AlertDialog open={isOpen} onOpenChange={closeDialog}>
            <AlertDialogContent>
                <form key={id} action={formAction}>
                    <input type="hidden" value={id} name="id" />
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete video?</AlertDialogTitle>
                        <AlertDialogDescription className="mb-4 space-y-4">
                            <p>This will permanently remove this video.</p>
                            {state.errors && (
                                <ul className="p-2 bg-red-100 rounded list-inside">
                                    {state.errors.map(error => (
                                        <li key={error} className="text-red-500 ">{error}</li>
                                    ))}
                                </ul>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel type="button">Cancel</AlertDialogCancel>
                        <AlertDialogAction asChild>
                            <DeleteButton />
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    )
}
