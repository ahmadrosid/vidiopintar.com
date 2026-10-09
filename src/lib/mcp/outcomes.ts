// Human-readable labels for the outcome values stored on each MCP request.
export const outcomeLabels: Record<string, string> = {
  success: "Berhasil",
  INVALID_VIDEO_REFERENCE: "Video tidak valid",
  CAPTIONS_UNAVAILABLE: "Tanpa transkrip",
  VIDEO_UNAVAILABLE: "Video tidak tersedia",
  INVALID_CURSOR: "Cursor kedaluwarsa",
  INVALID_CREDENTIALS: "Key tidak valid",
  USAGE_LIMIT_EXCEEDED: "Batas tercapai",
  TEMPORARY_PROVIDER_FAILURE: "Gangguan YouTube",
  SERVICE_MISCONFIGURED: "Gangguan layanan",
};
