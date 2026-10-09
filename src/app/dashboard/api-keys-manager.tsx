"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { CheckIcon, Copy01Icon } from "@hugeicons/core-free-icons";
import { useActionState, useEffect, useState, useTransition } from "react";
import { format } from "date-fns";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  createKeyAction,
  revokeKeyAction,
  type CreateKeyState,
} from "./actions";
import { InstallTabs } from "@/components/home/install-tabs";

interface ApiKeysManagerProps {
  keys: Array<{
    id: string;
    name: string;
    prefix: string;
    createdAt: Date;
    requestsToday: number;
    requestsPerDay: number;
  }>;
  header: React.ReactNode;
}

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-accent";

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
    <div className="border border-site-line border-l-2 border-l-site-accent bg-site-panel">
      <div className="flex items-center justify-between gap-4 border-b border-site-line bg-site-header px-4 py-2">
        <span className="truncate text-xs text-site-text-muted sm:text-sm">
          {name} · hanya tampil sekali
        </span>
        <button
          type="button"
          onClick={copy}
          className={`inline-flex shrink-0 cursor-pointer items-center gap-1.5 text-xs text-site-text-muted hover:text-site-text sm:text-sm ${focusRing}`}
        >
          {copied ? (
            <HugeiconsIcon
              icon={CheckIcon}
              className="size-4 text-site-accent"
            />
          ) : (
            <HugeiconsIcon icon={Copy01Icon} className="size-4" />
          )}
          {copied ? "Tersalin" : "Salin"}
        </button>
      </div>
      <p className="break-all p-5 text-sm leading-7 text-site-text sm:text-base">
        {token}
      </p>
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
          className={`shrink-0 cursor-pointer text-sm text-site-text-muted underline decoration-site-line-strong underline-offset-4 hover:text-site-text disabled:opacity-50 ${focusRing}`}
        >
          {pending ? "Menghapus..." : "Hapus"}
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md rounded-none border-site-line bg-site-panel font-mono text-site-text">
        <AlertDialogHeader>
          <AlertDialogTitle className="font-display text-2xl font-extrabold tracking-tight text-site-text">
            Hapus key “{name}”?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-site-text-2">
            Agen yang memakai key ini akan langsung ditolak. Tindakan ini tidak
            dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            className={`min-h-12 cursor-pointer rounded-none border-site-line bg-transparent px-6 font-display text-lg font-bold text-site-text hover:bg-site-header ${focusRing}`}
          >
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => startTransition(() => revokeKeyAction(id))}
            className={`min-h-12 cursor-pointer rounded-none bg-site-accent-fill px-6 font-display text-lg font-bold text-[#0d0f12] hover:bg-site-accent-fill-hover ${focusRing}`}
          >
            Hapus
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export function ApiKeysManager({ keys, header }: ApiKeysManagerProps) {
  const [state, formAction, pending] = useActionState<CreateKeyState, FormData>(
    createKeyAction,
    { status: "idle" },
  );
  const [open, setOpen] = useState(false);
  // Holds the new key while the dialog shows its setup view; cleared when the dialog reopens.
  const [created, setCreated] = useState<{
    token: string;
    name: string;
  } | null>(null);

  useEffect(() => {
    if (state.status === "created")
      setCreated({ token: state.token, name: state.name });
  }, [state]);

  const changeOpen = (next: boolean) => {
    setOpen(next);
    if (next) setCreated(null);
  };

  // The full key is only known right after creation; the server stores a hash.
  const createdToken = state.status === "created" ? state.token : undefined;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-4 text-base leading-8 text-site-text-2 sm:text-lg">
        {header}
        <Dialog open={open} onOpenChange={changeOpen}>
          <DialogTrigger asChild>
            <button
              type="button"
              className={`ml-auto inline-flex min-h-12 cursor-pointer items-center justify-center bg-site-accent-fill px-6 font-display text-lg font-bold text-[#0d0f12] transition-colors hover:bg-site-accent-fill-hover ${focusRing}`}
            >
              Buat key
            </button>
          </DialogTrigger>
          <DialogContent
            className={`${created ? "max-w-2xl" : "max-w-md"} rounded-none border-site-line bg-site-panel font-mono text-site-text`}
          >
            {created ? (
              <>
                <DialogHeader>
                  <DialogTitle className="font-display text-2xl font-extrabold tracking-tight text-site-text">
                    Key “{created.name}” dibuat
                  </DialogTitle>
                  <DialogDescription className="text-site-text-2">
                    Salin konfigurasi di bawah ke klien Anda. Key ini hanya
                    ditampilkan sekali.
                  </DialogDescription>
                </DialogHeader>
                <InstallTabs stacked apiKey={created.token} />
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className={`inline-flex min-h-12 w-full cursor-pointer items-center justify-center bg-site-accent-fill px-6 font-display text-lg font-bold text-[#0d0f12] transition-colors hover:bg-site-accent-fill-hover ${focusRing}`}
                >
                  Selesai
                </button>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle className="font-display text-2xl font-extrabold tracking-tight text-site-text">
                    Buat API key
                  </DialogTitle>
                  <DialogDescription className="text-site-text-2">
                    Beri nama agar mudah dikenali. Key hanya ditampilkan sekali
                    setelah dibuat.
                  </DialogDescription>
                </DialogHeader>
                <form action={formAction} className="flex flex-col gap-3">
                  <label
                    htmlFor="key-name"
                    className="text-sm text-site-text-muted"
                  >
                    Nama key
                  </label>
                  <input
                    id="key-name"
                    name="name"
                    required
                    maxLength={60}
                    placeholder="Contoh: Produksi"
                    className={`min-h-12 w-full min-w-0 border border-site-line bg-site-bg px-4 text-base text-site-text placeholder:text-site-text-faint ${focusRing}`}
                  />
                  {state.status === "error" && (
                    <p className="text-sm text-site-accent-hover">
                      {state.message}
                    </p>
                  )}
                  <button
                    type="submit"
                    disabled={pending}
                    className={`inline-flex min-h-12 w-full cursor-pointer items-center justify-center bg-site-accent-fill px-6 font-display text-lg font-bold text-[#0d0f12] transition-colors hover:bg-site-accent-fill-hover disabled:opacity-60 ${focusRing}`}
                  >
                    {pending ? "Membuat..." : "Buat key"}
                  </button>
                </form>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
      {state.status === "created" && (
        <NewKey token={state.token} name={state.name} />
      )}

      {keys.length === 0 ? (
        <p className="text-site-text-faint">Belum ada key aktif.</p>
      ) : (
        <div className="overflow-x-auto border border-site-line bg-white">
          <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
            <thead className="bg-site-header text-site-text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Nama</th>
                <th className="px-4 py-3 font-medium">Prefix</th>
                <th className="px-4 py-3 font-medium">Dibuat</th>
                <th className="px-4 py-3 text-right font-medium">
                  Pemakaian hari ini
                </th>
                <th className="px-4 py-3 text-right font-medium">
                  <span className="sr-only">Aksi</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {keys.map((key) => (
                <tr key={key.id} className="border-t border-site-line">
                  <td className="px-4 py-3 text-site-text">{key.name}</td>
                  <td className="px-4 py-3 text-site-text-muted">
                    {key.prefix}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-site-text-muted">
                    {format(key.createdAt, "d MMM yyyy")}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap text-site-text-muted">
                    {key.requestsToday}/{key.requestsPerDay}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <RevokeButton id={key.id} name={key.name} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-3 space-y-4">
        <h3 className="font-display text-lg font-bold tracking-tight text-site-text">
          Cara menghubungkan MCP
        </h3>
        <p className="text-sm leading-7 text-site-text-2">
          {createdToken ? (
            "Salinan di bawah sudah berisi key baru. Tampilan hanya menampilkan sebagian key."
          ) : (
            <>
              Pilih klien Anda, salin konfigurasinya, lalu ganti{" "}
              <code className="text-site-text">&lt;API_KEY&gt;</code> dengan key
              Anda.
            </>
          )}
        </p>
        <InstallTabs stacked apiKey={createdToken} />
      </div>
    </div>
  );
}
