"use client";

import { handleVideoSubmit } from "@/app/actions"
import { useState, useEffect, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
import { PromptInput, PromptInputTextarea, PromptInputActions } from "@/components/ui/prompt-input";
import { toast } from "sonner";

function SubmitButton() {
  const { pending } = useFormStatus();
  
  return (
    <Button type="submit" disabled={pending} className="rounded-xl cursor-pointer">
      {pending ? <Loader className="size-4 animate-spin" /> : "Submit"}
    </Button>
  );
}

export function VideoSubmitForm() {
  const [input, setInput] = useState("")
  const [state, formAction] = useActionState(handleVideoSubmit, { success: false, errors: undefined });
  
  useEffect(() => {
    if (state.errors && state.errors.length > 0) {
      state.errors.forEach(error => {
        toast.error(error);
      });
    }
  }, [state.errors]);
  
  return (
    <form action={formAction} className="space-y-4">
      <PromptInput
        value={input}
        onValueChange={(value) => setInput(value)}>
        <PromptInputTextarea
          name="videoUrl"
          placeholder="Paste YouTube link here..."
          className="bg-transparent!"
          required
        />
        <PromptInputActions className="justify-end pt-2">
          <SubmitButton />
        </PromptInputActions>
      </PromptInput>
    </form>
  )
}
