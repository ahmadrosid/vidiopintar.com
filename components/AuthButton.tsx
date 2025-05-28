"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"; // Assuming this path is correct

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    // Optionally, use a loading spinner component if available
    return <p>Loading...</p>; 
  }

  if (session && session.user) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {session.user.image && (
          <Avatar>
            <AvatarImage src={session.user.image} alt={session.user.name || session.user.email || "User avatar"} />
            <AvatarFallback>{session.user.name?.[0] || session.user.email?.[0]}</AvatarFallback>
          </Avatar>
        )}
        <span>{session.user.email || session.user.name}</span>
        <Button onClick={() => signOut()}>Logout</Button>
      </div>
    );
  }

  return <Button onClick={() => signIn("google")}>Login with Google</Button>;
}
