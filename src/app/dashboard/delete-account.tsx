"use client";

import { useState } from "react";
import { useClerk } from "@clerk/nextjs";
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
} from "@/components/ui/alert-dialog";

export function DeleteAccount() {
  const { signOut } = useClerk();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);

    try {
      const response = await fetch("/api/user/delete", { method: "DELETE" });

      if (response.ok) {
        await signOut({ redirectUrl: "/" });
      }
    } catch (error) {
      console.error("Failed to delete account:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          disabled={isDeleting}
          className="cursor-pointer text-sm text-site-text-muted underline decoration-site-line-strong underline-offset-4 hover:text-site-text disabled:opacity-50"
        >
          {isDeleting ? "Menghapus..." : "Hapus akun dan semua key"}
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus akun?</AlertDialogTitle>
          <AlertDialogDescription>
            Semua API key Anda langsung berhenti bekerja dan data akun dihapus. Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Hapus akun</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
