export type McpErrorCode =
  | "INVALID_VIDEO_REFERENCE"
  | "CAPTIONS_UNAVAILABLE"
  | "VIDEO_UNAVAILABLE"
  | "INVALID_CURSOR"
  | "INVALID_CREDENTIALS"
  | "USAGE_LIMIT_EXCEEDED"
  | "TEMPORARY_PROVIDER_FAILURE"
  | "SERVICE_MISCONFIGURED";

const messages: Record<McpErrorCode, string> = {
  INVALID_VIDEO_REFERENCE: "Masukkan URL YouTube atau ID video yang valid.",
  CAPTIONS_UNAVAILABLE: "Transkrip tidak tersedia untuk video ini.",
  VIDEO_UNAVAILABLE: "Video ini tidak tersedia di YouTube.",
  INVALID_CURSOR: "Cursor sudah tidak berlaku. Mulai lagi dari awal.",
  INVALID_CREDENTIALS: "API key tidak valid atau sudah dicabut.",
  USAGE_LIMIT_EXCEEDED: "Batas penggunaan API key ini sudah tercapai.",
  TEMPORARY_PROVIDER_FAILURE:
    "YouTube sedang membatasi permintaan. Coba lagi beberapa saat lagi.",
  SERVICE_MISCONFIGURED: "Layanan transkrip sedang mengalami gangguan.",
};

export class McpServiceError extends Error {
  constructor(
    readonly code: McpErrorCode,
    readonly retryable = false,
    readonly retryAfter?: number,
  ) {
    super(messages[code]);
    this.name = "McpServiceError";
  }
}
