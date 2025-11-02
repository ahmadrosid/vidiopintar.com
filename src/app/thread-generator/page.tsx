"use client";

import { FooterSection } from "@/components/footer";
import { HeroHeader } from "@/components/hero-header";
import { ThreadGeneratorForm } from "@/components/thread-generator/thread-generator-form";
import { notFound } from "next/navigation";

export default function ThreadGeneratorPage() {
  if (true) {
    return notFound();
  }

  return (
    <>
      <HeroHeader />
      <div className="bg-accent min-h-screen pb-12">
        <div className="max-w-5xl px-6 mx-auto pt-32">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Thread Generator</h1>
            <p className="text-muted-foreground">
              Generate engaging threads from YouTube videos. Simply paste a
              YouTube URL and let AI create viral-ready threads.
            </p>
          </div>
          <ThreadGeneratorForm />
        </div>
      </div>
      <FooterSection />
    </>
  );
}
