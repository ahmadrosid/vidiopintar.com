"use client";

import { useActionState, useState, useTransition } from "react";
import { format } from "date-fns";
import { Check, Copy } from "@phosphor-icons/react";
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
import { createKeyAction, revokeKeyAction, type CreateKeyState } from "./actions";

interface ApiKeysManagerProps {
  keys: Array<{ id: string; name: string; prefix: string; createdAt: Date; requestsToday: number; requestsPerDay: number }>;
}

const focusRing = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e28fab]";

function NewKey({ token, name }: { token: string; name: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="border border-[#2a2d34] border-l-2 border-l-[#e28fab] bg-[#0b0c0f]">
      <div className="flex items-center justify-between gap-4 border-b border-[#2a2d34] bg-[#16181c] px-4 py-2">
        <span className="truncate text-xs text-[#8c95a1] sm:text-sm">{name} · hanya tampil sekali</span>
        <button
          type="button"
          onClick={copy}
          className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 text-xs text-[#8c95a1] hover:text-white sm:text-sm ${focusRing}`}
        >
          {copied ? <Check className="size-4 text-[#e28fab]" /> : <Copy className="size-4" />}
          {copied ? "Tersalin" : "Salin"}
        </button>
      </div>
      <p className="break-all p-5 text-sm leading-7 text-[#e8ebef] sm:text-base">{token}</p>
    </div>
  );
}

function RevokeButton({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          disabled={pending}
          className={`shrink-0 cursor-pointer text-sm text-[#8c95a1] underline decoration-[#484a52] underline-offset-4 hover:text-white disabled:opacity-50 ${focusRing}`}
        >
          {pending ? "Mencabut..." : "Cabut"}
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cabut key “{name}”?</AlertDialogTitle>
          <AlertDialogDescription>
            Agen yang memakai key ini akan langsung ditolak. Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={() => startTransition(() => revokeKeyAction(id))}>Cabut key</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function ApiKeysManager({ keys }: ApiKeysManagerProps) {
  const [state, formAction, pending] = useActionState<CreateKeyState, FormData>(createKeyAction, { status: "idle" });

  return (
    <div className="space-y-5 pt-2">
      <form action={formAction} className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="key-name" className="sr-only">Nama key</label>
        <input
          id="key-name"
          name="name"
          required
          maxLength={60}
          placeholder="Nama key"
          className={`min-h-12 w-full min-w-0 border border-[#2a2d34] bg-[#0b0c0f] px-4 text-base text-[#e8ebef] placeholder:text-[#6f7782] ${focusRing}`}
        />
        <button
          type="submit"
          disabled={pending}
          className={`inline-flex min-h-12 shrink-0 cursor-pointer items-center justify-center bg-[#e28fab] px-6 font-display text-lg font-bold text-[#0d0f12] transition-colors hover:bg-[#f2b2c4] disabled:opacity-60 ${focusRing}`}
        >
          {pending ? "Membuat..." : "Buat key"}
        </button>
      </form>
      {state.status === "error" && <p className="text-sm text-[#f2b2c4]">{state.message}</p>}
      {state.status === "created" && <NewKey token={state.token} name={state.name} />}

      {keys.length === 0 ? (
        <p className="text-[#6f7782]">Belum ada key aktif.</p>
      ) : (
        <ul className="border border-[#2a2d34]">
          {keys.map((key, index) => (
            <li
              key={key.id}
              className={`flex items-center gap-4 px-4 py-3 ${index > 0 ? "border-t border-[#2a2d34]" : ""}`}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-[#e8ebef]">{key.name}</p>
                <p className="truncate text-sm text-[#8c95a1]">
                  {key.prefix} · {format(key.createdAt, "d MMM yyyy")} · {key.requestsToday}/{key.requestsPerDay} hari ini
                </p>
              </div>
              <RevokeButton id={key.id} name={key.name} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
