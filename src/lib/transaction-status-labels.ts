const statusLabels = new Map<string, string>([
  ["confirmed", "Berhasil"],
  ["pending", "Menunggu"],
  ["waiting_confirmation", "Menunggu konfirmasi"],
  ["expired", "Kedaluwarsa"],
  ["cancelled", "Dibatalkan"],
]);

export function transactionStatusLabel(status: string): string {
  return statusLabels.get(status) ?? status;
}
