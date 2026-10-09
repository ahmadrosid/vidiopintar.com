"use client";

import { useState } from "react";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { confirmTransactionAction } from "./actions";

interface ConfirmTransactionButtonProps {
  transactionId: string;
  reference: string;
  amountLabel: string;
  email: string;
}

const buttonClass =
  "inline-flex min-h-10 cursor-pointer items-center justify-center px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-accent";

// Confirming activates the user's plan, so ask once more before submitting.
export function ConfirmTransactionButton({ transactionId, reference, amountLabel, email }: ConfirmTransactionButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button type="button" className={`${buttonClass} bg-site-accent-fill text-[#0d0f12] hover:bg-site-accent-fill-hover`}>
          Konfirmasi
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-md rounded-none border-site-line bg-site-panel font-mono text-site-text">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-extrabold tracking-tight text-site-text">Konfirmasi pembayaran?</DialogTitle>
          <DialogDescription className="text-site-text-2">
            Paket akan langsung aktif untuk pengguna ini. Pastikan dana sudah masuk ke rekening.
          </DialogDescription>
        </DialogHeader>

        <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
          <dt className="text-site-text-muted">Pengguna</dt>
          <dd className="break-all text-site-text">{email}</dd>
          <dt className="text-site-text-muted">Jumlah</dt>
          <dd className="text-site-text">{amountLabel}</dd>
          <dt className="text-site-text-muted">Referensi</dt>
          <dd className="text-site-text">{reference}</dd>
        </dl>

        <DialogFooter className="gap-3 sm:justify-start">
          <form action={confirmTransactionAction} onSubmit={() => setOpen(false)}>
            <input type="hidden" name="id" value={transactionId} />
            <button type="submit" className={`${buttonClass} bg-site-accent-fill text-[#0d0f12] hover:bg-site-accent-fill-hover`}>
              Ya, konfirmasi
            </button>
          </form>
          <DialogClose asChild>
            <button type="button" className={`${buttonClass} border border-site-line text-site-text-2 hover:border-site-line-strong`}>
              Batal
            </button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
