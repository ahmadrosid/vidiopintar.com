export const categories = [
  {
    slug: "productivity",
    label: "Productivity",
    image: "https://images.unsplash.com/photo-1531489956451-20957fab52f2?q=80&w=1280&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    searchQuery: "productivity tips"
  },
  {
    slug: "anthropology",
    label: "Anthropology",
    image: "https://images.unsplash.com/photo-1734638053787-4f849ed09615?q=80&w=1280&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    searchQuery: "anthropology documentary"
  },
  {
    slug: "mental-health",
    label: "Mental Health",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1280&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    searchQuery: "mental health wellness"
  },
  {
    slug: "marketing",
    label: "Marketing",
    image: "https://images.unsplash.com/photo-1543840302-34f367d7024f?q=80&w=1280&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    searchQuery: "digital marketing tips"
  },
  {
    slug: "copywriting",
    label: "Copywriting",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?q=80&w=1280&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    searchQuery: "copywriting techniques"
  },
  {
    slug: "economics",
    label: "Economics",
    image: "https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?q=80&w=1280&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    searchQuery: "economics explained"
  },
  {
    slug: "geography",
    label: "Geography",
    image: "https://images.unsplash.com/photo-1645207563387-240c50a0d5d3?q=80&w=1280&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    searchQuery: "geography documentary"
  },
  {
    slug: "history",
    label: "History",
    image: "https://images.unsplash.com/photo-1461360228754-6e81c478b882?q=80&w=1280&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    searchQuery: "history documentary"
  },
];

export function getCategoryBySlug(slug: string) {
  return categories.find(category => category.slug === slug);
}