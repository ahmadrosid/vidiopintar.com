"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { CheckIcon, Copy01Icon } from "@hugeicons/core-free-icons";
import { useState } from "react";
import {
  AntigravityIcon,
  ClaudeCodeIcon,
  CodexIcon,
  CursorIcon,
  GrokIcon,
  HermesIcon,
  OpenAIIcon,
  OpenClawIcon,
  PiIcon,
} from "@/components/home/client-icons";

const endpoint = "https://vidiopintar.com/api/mcp";

const clients = [
  {
    id: "claude-code",
    label: "Claude Code",
    Icon: ClaudeCodeIcon,
    where: "terminal",
    code: `claude mcp add --transport http vidiopintar \\
  ${endpoint} \\
  --header "Authorization: Bearer <API_KEY>"`,
  },
  {
    id: "codex",
    label: "Codex",
    Icon: CodexIcon,
    where: "~/.codex/config.toml",
    code: `# export VIDIOPINTAR_API_KEY=<API_KEY>
[mcp_servers.vidiopintar]
url = "${endpoint}"
bearer_token_env_var = "VIDIOPINTAR_API_KEY"`,
  },
  {
    id: "cursor",
    label: "Cursor",
    Icon: CursorIcon,
    where: "~/.cursor/mcp.json",
    code: `{
  "mcpServers": {
    "vidiopintar": {
      "url": "${endpoint}",
      "headers": { "Authorization": "Bearer <API_KEY>" }
    }
  }
}`,
  },
  {
    id: "antigravity",
    label: "Antigravity",
    Icon: AntigravityIcon,
    where: "~/.gemini/config/mcp_config.json",
    code: `{
  "mcpServers": {
    "vidiopintar": {
      "serverUrl": "${endpoint}",
      "headers": { "Authorization": "Bearer <API_KEY>" }
    }
  }
}`,
  },
  {
    id: "hermes",
    label: "Hermes Agent",
    Icon: HermesIcon,
    where: "~/.hermes/config.yaml",
    code: `mcp_servers:
  vidiopintar:
    url: "${endpoint}"
    headers:
      Authorization: "Bearer <API_KEY>"`,
  },
  {
    id: "openclaw",
    label: "OpenClaw",
    Icon: OpenClawIcon,
    where: "~/.openclaw/openclaw.json",
    code: `// export VIDIOPINTAR_API_KEY=<API_KEY>
{
  mcp: {
    servers: {
      vidiopintar: {
        url: "${endpoint}",
        transport: "streamable-http",
        headers: { Authorization: "Bearer \${VIDIOPINTAR_API_KEY}" },
      },
    },
  },
}`,
  },
  {
    id: "openai",
    label: "OpenAI API",
    Icon: OpenAIIcon,
    where: "Responses API · tools",
    code: `{
  "type": "mcp",
  "server_label": "vidiopintar",
  "server_url": "${endpoint}",
  "headers": { "Authorization": "Bearer <API_KEY>" },
  "require_approval": "never"
}`,
  },
  {
    id: "grok",
    label: "Grok API",
    Icon: GrokIcon,
    where: "xAI Responses API · tools",
    code: `{
  "type": "mcp",
  "server_label": "vidiopintar",
  "server_url": "${endpoint}",
  "headers": { "Authorization": "Bearer <API_KEY>" }
}`,
  },
  {
    id: "pi",
    label: "pi",
    Icon: PiIcon,
    where: "terminal",
    code: `# export VIDIOPINTAR_API_KEY=<API_KEY>
pi mcp add vidiopintar --url ${endpoint} \\
  --bearer-token-env-var VIDIOPINTAR_API_KEY`,
  },
];

const keyPlaceholder = "<API_KEY>";

// Shows only the key prefix; the full key is kept for copying.
const redactKey = (key: string) => `${key.slice(0, 9)}${"•".repeat(24)}`;

export function InstallTabs({
  stacked = false,
  apiKey,
}: {
  stacked?: boolean;
  apiKey?: string;
}) {
  const [active, setActive] = useState(clients[0].id);
  const [copied, setCopied] = useState(false);
  const client = clients.find((item) => item.id === active) ?? clients[0];

  const shownCode = apiKey
    ? client.code.replaceAll(keyPlaceholder, redactKey(apiKey))
    : client.code;

  const copyCode = apiKey
    ? client.code.replaceAll(keyPlaceholder, apiKey)
    : client.code;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(copyCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div
      className={`grid gap-4 ${stacked ? "" : "md:grid-cols-[13rem_minmax(0,1fr)] md:gap-6"}`}
    >
      <div
        role="tablist"
        aria-label="Klien MCP"
        aria-orientation={stacked ? "horizontal" : "vertical"}
        className={`flex flex-wrap gap-2 ${stacked ? "" : "md:flex-col md:flex-nowrap"}`}
      >
        {clients.map(({ id, label, Icon }) => (
          <button
            key={id}
            role="tab"
            type="button"
            aria-selected={id === active}
            onClick={() => {
              setActive(id);
              setCopied(false);
            }}
            className={`inline-flex min-h-12 cursor-pointer items-center gap-3 border px-4 py-2 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-accent sm:text-base ${stacked ? "" : "md:w-full"} ${
              id === active
                ? "border-site-accent bg-site-accent-soft text-site-text"
                : "border-site-line text-site-text-muted hover:border-site-line-strong hover:text-site-text"
            }`}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        className="flex min-w-0 flex-col border border-site-line bg-site-panel"
      >
        <div className="flex items-center justify-between gap-4 border-b border-site-line bg-site-header px-4 py-2">
          <span className="truncate text-xs text-site-text-muted sm:text-sm">
            {client.where}
          </span>
          <button
            type="button"
            onClick={copy}
            className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 text-xs text-site-text-muted hover:text-site-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-site-accent sm:text-sm"
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
        <pre className="flex-1 overflow-x-auto p-5 text-sm leading-7 text-site-text sm:text-base">
          <code>{shownCode}</code>
        </pre>
      </div>
    </div>
  );
}
