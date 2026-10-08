"use client";

import { useEffect, useState } from "react";

type Line = { text: string; className: string };

const lines: Line[] = [
  { text: "> ringkas video ini: youtu.be/8aGhZQkoFbQ", className: "text-[#e8ebef]" },
  { text: "", className: "" },
  { text: "⏺ youtube_get_transcript", className: "text-[#65c9ad]" },
  { text: "  ⎿ 412 segmen", className: "text-[#6f7782]" },
  { text: "", className: "" },
  { text: "  [00:00] Event loop menjalankan satu tugas.", className: "text-[#c3c9d1]" },
  { text: "  [05:12] Callback menunggu stack kosong.", className: "text-[#c3c9d1]" },
  { text: "  [11:47] setTimeout(0) tidak langsung jalan.", className: "text-[#c3c9d1]" },
];

const fullText = lines.map((line) => line.text).join("\n");

export function AgentDemo() {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(fullText.length);
      return;
    }
    let count = 0;
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      count += 1;
      setShown(count);
      if (count < fullText.length) {
        const pause = fullText[count - 1] === "\n" ? 180 : 14;
        timer = setTimeout(tick, pause);
      } else {
        timer = setTimeout(() => {
          count = 0;
          tick();
        }, 6000);
      }
    };
    timer = setTimeout(tick, 400);
    return () => clearTimeout(timer);
  }, []);

  let remaining = shown;
  return (
    <figure className="border border-[#25272d] bg-[#0d0f12]">
      {/* Reserve full height so the page does not jump while typing. */}
      <div className="relative overflow-x-auto p-5 text-sm leading-7 sm:p-8 sm:text-lg sm:leading-8">
        <pre aria-hidden className="invisible">{fullText}</pre>
        <pre aria-label="Contoh agen AI memanggil youtube_get_transcript lalu meringkas video dengan penanda waktu" className="absolute inset-0 p-5 sm:p-8">
          {lines.map((line, index) => {
            const visible = line.text.slice(0, Math.max(0, remaining));
            remaining -= line.text.length + 1;
            return (
              <span key={index} className={line.className}>
                {visible}
                {index < lines.length - 1 && remaining >= 0 ? "\n" : ""}
              </span>
            );
          })}
          <span className="animate-pulse text-[#65c9ad]">▍</span>
        </pre>
      </div>
    </figure>
  );
}
