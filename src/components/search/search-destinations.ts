export type SearchDestination = {
  href: string;
  labelKey: "home" | "library" | "notes" | "chats" | "shared";
};

export const SEARCH_DESTINATIONS: SearchDestination[] = [
  { href: "/home", labelKey: "home" },
  { href: "/library", labelKey: "library" },
  { href: "/notes", labelKey: "notes" },
  { href: "/profile/chat", labelKey: "chats" },
  { href: "/profile/shared", labelKey: "shared" },
];
