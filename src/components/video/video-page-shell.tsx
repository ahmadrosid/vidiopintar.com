"use client";

import { ReactNode, useEffect, useState } from "react";

type VideoPageShellProps = {
  desktop: ReactNode;
  mobile: ReactNode;
};

/**
 * Mounts only the active breakpoint layout so we don't create two YouTube
 * players that fight over the shared video store (hidden iframe "background" play).
 */
export function VideoPageShell({ desktop, mobile }: VideoPageShellProps) {
  // Default to desktop to match SSR; correct on the client after mount.
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsDesktop(mediaQuery.matches);

    sync();
    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  if (isDesktop) {
    return <div className="h-full min-h-0">{desktop}</div>;
  }

  return <div className="flex flex-col h-full min-h-0">{mobile}</div>;
}
