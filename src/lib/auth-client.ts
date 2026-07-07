"use client";

import { useAuth, useUser } from "@clerk/nextjs";

export function useSession() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user, isLoaded: userLoaded } = useUser();

  const isPending = !isLoaded || !userLoaded;

  if (!isSignedIn || !user) {
    return { data: null, isPending };
  }

  return {
    data: {
      user: {
        id: user.id,
        name: user.fullName ?? user.firstName ?? "",
        email: user.primaryEmailAddress?.emailAddress ?? "",
        image: user.imageUrl,
      },
    },
    isPending,
  };
}
