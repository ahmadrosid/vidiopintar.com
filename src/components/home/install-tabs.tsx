"use client";

import { useState } from "react";

const endpoint = "https://vidiopintar.com/api/mcp";

const clients = [
  {
    id: "claude-code",
    label: "Claude Code",
    code: `claude mcp add --transport http vidiopintar ${endpoint} \\
  --header "Authorization: Bearer <API_KEY>"`,
  },
  {
    id: "cursor",
    label: "Cursor",
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
    id: "vscode",
    label: "VS Code",
    code: `{
  "servers": {
    "vidiopintar": {
      "type": "http",
      "url": "${endpoint}",
      "headers": { "Authorization": "Bearer <API_KEY>" }
    }
  }
}`,
  },
  {
    id: "other",
    label: "Lainnya",
    code: `{
  "mcpServers": {
    "vidiopintar": {
      "type": "http",
      "url": "${endpoint}",
      "headers": { "Authorization": "Bearer <API_KEY>" }
    }
  }
}`,
  },
];

export function InstallTabs() {
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
    <div className="border border-[#25272d] bg-[#0d0f12]">
      <div role="tablist" aria-label="Klien MCP" className="flex overflow-x-auto border-b border-[#25272d]">
        {clients.map((item) => (
          <button
            key={item.id}
            role="tab"
            type="button"
            aria-selected={item.id === active}
            onClick={() => {
              setActive(item.id);
              setCopied(false);
            }}
            className={`min-h-12 shrink-0 px-5 text-sm transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#65c9ad] sm:text-base ${
              item.id === active
                ? "border-b border-[#65c9ad] text-[#e8ebef]"
                : "text-[#6f7782] hover:text-[#c3c9d1]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="p-5 sm:p-8">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={copy}
            className="min-h-9 shrink-0 border border-[#303239] px-4 text-sm text-[#c3c9d1] transition-colors hover:border-[#65c9ad] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#65c9ad]"
          >
            {copied ? "Tersalin ✓" : "Salin"}
          </button>
        </div>
        <pre className="mt-2 overflow-x-auto text-sm leading-7 text-[#c9cbd1] sm:text-base">
          <code>{client.code}</code>
        </pre>
      </div>
    </div>
  );
}
