"use client";

import { useState } from "react";
import { Check, Copy } from "@phosphor-icons/react";
import {
  AntigravityIcon,
  ClaudeCodeIcon,
  CodexIcon,
  CursorIcon,
  GrokIcon,
  HermesIcon,
  OpenAIIcon,
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

// `stacked` puts the agent list above the snippet, for narrow columns like the docs.
export function InstallTabs({ stacked = false }: { stacked?: boolean }) {
  const [active, setActive] = useState(clients[0].id);
  const [copied, setCopied] = useState(false);
  const client = clients.find((item) => item.id === active) ?? clients[0];

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(client.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={`grid gap-4 ${stacked ? "" : "md:grid-cols-[13rem_minmax(0,1fr)] md:gap-6"}`}>
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
            className={`inline-flex min-h-12 cursor-pointer items-center gap-3 border px-4 py-2 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e28fab] sm:text-base ${stacked ? "" : "md:w-full"} ${
              id === active
                ? "border-[#e28fab] bg-[#2d1f2a] text-[#e8ebef]"
                : "border-[#2a2d34] text-[#8c95a1] hover:border-[#484a52] hover:text-[#e8ebef]"
            }`}
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </button>
        ))}
      </div>

      <div role="tabpanel" className="flex min-w-0 flex-col border border-[#2a2d34] bg-[#0b0c0f]">
        <div className="flex items-center justify-between gap-4 border-b border-[#2a2d34] bg-[#16181c] px-4 py-2">
          <span className="truncate text-xs text-[#8c95a1] sm:text-sm">{client.where}</span>
          <button
            type="button"
            onClick={copy}
            className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 text-xs text-[#8c95a1] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e28fab] sm:text-sm"
          >
            {copied ? <Check className="size-4 text-[#e28fab]" /> : <Copy className="size-4" />}
            {copied ? "Tersalin" : "Salin"}
          </button>
        </div>
        <pre className="flex-1 overflow-x-auto p-5 text-sm leading-7 text-[#e8ebef] sm:text-base">
          <code>{client.code}</code>
        </pre>
      </div>
    </div>
  );
}
