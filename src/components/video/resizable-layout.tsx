"use client";

import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import { ReactNode } from "react";

interface ResizableLayoutProps {
  videoSection: ReactNode;
  chatSection: ReactNode;
}

export function ResizableLayout({
  videoSection,
  chatSection,
}: ResizableLayoutProps) {
  return (
    <PanelGroup direction="horizontal" className="h-screen overflow-hidden">
      <Panel
        defaultSize={57}
        minSize={30}
        maxSize={80}
        className="min-h-0 overflow-hidden flex flex-col"
      >
        <div className="flex-1 overflow-y-auto scrollbar-none max-h-screen">
          {videoSection}
        </div>
      </Panel>
      <PanelResizeHandle className="w-px bg-border hover:bg-accent-foreground/40 transition-colors cursor-col-resize group relative">
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-border group-hover:bg-accent-foreground/50 transition-colors" />
      </PanelResizeHandle>
      <Panel
        defaultSize={43}
        minSize={20}
        maxSize={70}
        className="h-full max-h-full min-h-0 overflow-hidden flex flex-col"
      >
        <div className="h-screen scrollbar-none">
            {chatSection}
        </div>
      </Panel>
    </PanelGroup>
  );
}

