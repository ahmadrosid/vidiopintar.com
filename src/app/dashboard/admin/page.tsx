import { requireAdmin } from "@/lib/auth-admin";
import { transactionsRepository } from "@/lib/db/repository/transactions";
import { Stat } from "@/components/site/site-page";
import { DashboardTitle } from "../dashboard-sidebar";
import { cancelTransactionAction } from "./actions";
import { ConfirmTransactionButton } from "./confirm-transaction-button";
import { transactionStatusLabel } from "@/lib/transaction-status-labels";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

const openStatuses = ["pending", "waiting_confirmation"];

const formatDay = (date: Date | string | number) =>
  new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" });

const amountFormat = (amount: number, currency: string) => `${currency} ${amount.toLocaleString("en-US")}`;

const buttonClass =
  "inline-flex min-h-10 cursor-pointer items-center justify-center px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-accent";

export default async function AdminPage() {
  await requireAdmin();
  const transactions = await transactionsRepository.getAll(100);
  const waiting = transactions.filter((t) => t.status === "waiting_confirmation").length;
  const open = transactions.filter((t) => openStatuses.includes(t.status)).length;

  return (
    <>
      <DashboardTitle meta="Konfirmasi pembayaran transfer bank dan kelola status transaksi.">Admin</DashboardTitle>

      <div className="mb-10 grid grid-cols-2 gap-6 sm:grid-cols-3">
        <Stat value={String(waiting)} unit="menunggu konfirmasi" />
        <Stat value={String(open)} unit="transaksi terbuka" />
        <Stat value={String(transactions.length)} unit="transaksi terbaru" />
      </div>

      {transactions.length === 0 ? (
        <p className="text-site-text-muted">Belum ada transaksi.</p>
      ) : (
        <div className="overflow-x-auto border border-site-line">
          <table className="w-full text-left text-sm">
            <thead className="bg-site-header text-site-text-muted">
              <tr>
                <th className="px-4 py-2.5 font-normal">Pengguna</th>
                <th className="px-4 py-2.5 font-normal">Paket</th>
                <th className="px-4 py-2.5 font-normal">Jumlah</th>
                <th className="px-4 py-2.5 font-normal">Referensi</th>
                <th className="px-4 py-2.5 font-normal">Status</th>
                <th className="px-4 py-2.5 font-normal">Dibuat</th>
                <th className="px-4 py-2.5 font-normal">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => {
                const isOpen = openStatuses.includes(transaction.status);

                return (
                  <tr key={transaction.id} className="border-t border-site-line">
                    <td className="whitespace-nowrap px-4 py-2.5 text-site-text">{transaction.user?.email ?? "–"}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 capitalize text-site-text">{transaction.planType}</td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-site-text tabular-nums">
                      {amountFormat(transaction.amount, transaction.currency)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 font-mono text-site-text-2">{transaction.transactionReference}</td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      <span
                        className={`border px-2 py-0.5 text-xs ${
                          isOpen ? "border-site-accent text-site-accent" : "border-site-line text-site-text-muted"
                        }`}
                      >
                        {transactionStatusLabel(transaction.status)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5 text-site-text-muted tabular-nums">
                      {formatDay(transaction.createdAt ?? new Date(0))}
                    </td>
                    <td className="whitespace-nowrap px-4 py-2.5">
                      {isOpen ? (
                        <div className="flex gap-2">
                          <ConfirmTransactionButton
                            transactionId={transaction.id}
                            reference={transaction.transactionReference}
                            amountLabel={amountFormat(transaction.amount, transaction.currency)}
                            email={transaction.user?.email ?? "–"}
                          />
                          <form action={cancelTransactionAction}>
                            <input type="hidden" name="id" value={transaction.id} />
                            <button type="submit" className={`${buttonClass} border border-site-line text-site-text-2 hover:border-site-line-strong`}>
                              Batalkan
                            </button>
                          </form>
                        </div>
                      ) : (
                        <span className="text-site-text-faint">–</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
