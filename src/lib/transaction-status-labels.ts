const statusLabels = new Map<string, string>([
  ["confirmed", "Berhasil"],
  ["pending", "Menunggu"],
  ["cancelled", "Dibatalkan"],
]);

export function transactionStatusLabel(status: string): string {
  return statusLabels.get(status) ?? status;
}
