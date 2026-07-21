export type SearchDestination = {
  href: string;
  labelKey: "home" | "library" | "notes" | "explore";
};

export const SEARCH_DESTINATIONS: SearchDestination[] = [
  { href: "/home", labelKey: "home" },
  { href: "/library", labelKey: "library" },
  { href: "/notes", labelKey: "notes" },
  { href: "/explore", labelKey: "explore" },
];
