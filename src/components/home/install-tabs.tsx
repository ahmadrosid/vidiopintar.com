"use client";

import { useState } from "react";

const endpoint = "https://vidiopintar.com/api/mcp";

const clients = [
  {
    id: "claude-code",
    label: "claude code",
    code: `claude mcp add --transport http vidiopintar \\
  ${endpoint} \\
  --header "Authorization: Bearer <API_KEY>"`,
  },
  {
    id: "cursor",
    label: "cursor",
    code: `// ~/.cursor/mcp.json
{
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
    label: "vs code",
    code: `// .vscode/mcp.json
{
  "servers": {
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
      await navigator.clipboard.writeText(client.code.replace(/^\/\/.*\n/, ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div>
      <div role="tablist" aria-label="Klien MCP" className="flex flex-wrap gap-x-5 gap-y-2">
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
            className={`focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#65c9ad] ${
              item.id === active
                ? "text-[#e8ebef] underline decoration-[#65c9ad] underline-offset-4"
                : "text-[#6f7782] hover:text-[#c3c9d1]"
            }`}
          >
            {item.label}
          </button>
        ))}
        <button
          type="button"
          onClick={copy}
          className="ml-auto text-[#6f7782] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#65c9ad]"
        >
          {copied ? "[tersalin]" : "[salin]"}
        </button>
      </div>
      <pre role="tabpanel" className="mt-5 overflow-x-auto text-sm leading-7 text-[#c9cbd1] sm:text-base">
        <code>{client.code}</code>
      </pre>
    </div>
  );
}
