"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type TranscriptLanguage = "en" | "id";

interface TranscriptLanguageSelectorProps {
  className?: string;
  initialLanguage: TranscriptLanguage;
}

const languageNames: Record<TranscriptLanguage, string> = {
  en: "Inggris",
  id: "Indonesia",
};

export function TranscriptLanguageSelector({
  className,
  initialLanguage,
}: TranscriptLanguageSelectorProps) {
  const router = useRouter();
  const [language, setLanguage] = useState(initialLanguage);

  const handleLanguageChange = async (nextLanguage: TranscriptLanguage) => {
    try {
      const response = await fetch("/api/user/language", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: nextLanguage }),
      });

      if (!response.ok) throw new Error("Language update failed");
      setLanguage(nextLanguage);
      router.refresh();
      toast.success(`Bahasa transkrip: ${languageNames[nextLanguage]}.`);
    } catch {
      toast.error("Bahasa transkrip tidak dapat diubah.");
    }
  };

  return (
    <Select value={language} onValueChange={handleLanguageChange}>
      <SelectTrigger aria-label="Pilih bahasa transkrip" className={cn("w-[160px]", className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(languageNames) as TranscriptLanguage[]).map((option) => (
          <SelectItem key={option} value={option}>
            {languageNames[option]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
