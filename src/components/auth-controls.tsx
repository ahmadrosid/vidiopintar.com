"use client";

import {
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function AuthControls() {
  return (
    <>
      <Show when="signed-in">
        <Button variant="ghost" className="cursor-pointer active:scale-[0.975]" asChild>
          <Link href="/home">Home</Link>
        </Button>
        <Button variant="ghost" className="cursor-pointer active:scale-[0.975]" asChild>
          <Link href="/blog">Blog</Link>
        </Button>
        <UserButton />
      </Show>
      <Show when="signed-out">
        <Button variant="ghost" className="cursor-pointer active:scale-[0.975]" asChild>
          <Link href="/blog">Blog</Link>
        </Button>
        <SignInButton mode="redirect">
          <Button variant="ghost" className="cursor-pointer active:scale-[0.975]">
            Login
          </Button>
        </SignInButton>
        <SignUpButton mode="redirect">
          <Button
            variant="outline"
            className="rounded-full dark:border-accent cursor-pointer transition active:scale-[0.975]"
          >
            Get Started
          </Button>
        </SignUpButton>
      </Show>
    </>
  );
}
