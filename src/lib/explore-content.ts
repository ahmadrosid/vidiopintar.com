export type ExploreCategoryId =
  | "technology"
  | "business"
  | "programming"
  | "ai-ml"
  | "design";

export type ExploreFilterId = "all" | ExploreCategoryId;

export type ExploreCategoryIcon =
  | "cpu"
  | "briefcase"
  | "code"
  | "brain"
  | "palette";

export type ExploreCategory = {
  id: ExploreCategoryId;
  icon: ExploreCategoryIcon;
};

export type ExploreTrendingVideo = {
  youtubeId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  categoryId: ExploreCategoryId;
  duration?: string;
};

export const EXPLORE_CATEGORIES: ExploreCategory[] = [
  { id: "technology", icon: "cpu" },
  { id: "business", icon: "briefcase" },
  { id: "programming", icon: "code" },
  { id: "ai-ml", icon: "brain" },
  { id: "design", icon: "palette" },
];

export const EXPLORE_TRENDING_VIDEOS: ExploreTrendingVideo[] = [
  {
    youtubeId: "UNzCG3lw6O0",
    title: "Building Great Agent Skills: The Missing Manual",
    channelTitle: "Matt Gray",
    thumbnailUrl: "https://i.ytimg.com/vi/UNzCG3lw6O0/mqdefault.jpg",
    categoryId: "ai-ml",
    duration: "22:11",
  },
  {
    youtubeId: "bSDprg24pEA",
    title: "How To Learn Any Skill So Fast It Feels Illegal",
    channelTitle: "Justin Sung",
    thumbnailUrl: "https://i.ytimg.com/vi/bSDprg24pEA/mqdefault.jpg",
    categoryId: "technology",
    duration: "18:42",
  },
  {
    youtubeId: "meMJdfytNI0",
    title: "How to Start a YouTube Channel - Beginners Guide (2026)",
    channelTitle: "Ali Abdaal",
    thumbnailUrl: "https://i.ytimg.com/vi/meMJdfytNI0/mqdefault.jpg",
    categoryId: "business",
    duration: "24:05",
  },
  {
    youtubeId: "lxpaSlImFHk",
    title: "How to Start a SaaS Business From Scratch",
    channelTitle: "Dan Martell",
    thumbnailUrl: "https://i.ytimg.com/vi/lxpaSlImFHk/mqdefault.jpg",
    categoryId: "business",
    duration: "31:20",
  },
  {
    youtubeId: "Rh3tobg7hlE",
    title: "React Hooks Explained — Beginner to Intermediate",
    channelTitle: "Web Dev Simplified",
    thumbnailUrl: "https://i.ytimg.com/vi/Rh3tobg7hlE/mqdefault.jpg",
    categoryId: "programming",
    duration: "16:48",
  },
  {
    youtubeId: "cQAL4c-bX6I",
    title: "UI Design Principles Every Designer Should Know",
    channelTitle: "Flux Academy",
    thumbnailUrl: "https://i.ytimg.com/vi/cQAL4c-bX6I/mqdefault.jpg",
    categoryId: "design",
    duration: "12:33",
  },
  {
    youtubeId: "aircAruvnKk",
    title: "But what is a neural network? | Deep learning",
    channelTitle: "3Blue1Brown",
    thumbnailUrl: "https://i.ytimg.com/vi/aircAruvnKk/mqdefault.jpg",
    categoryId: "ai-ml",
    duration: "19:13",
  },
  {
    youtubeId: "PkZNo7MFNFg",
    title: "Learn JavaScript - Full Course for Beginners",
    channelTitle: "freeCodeCamp.org",
    thumbnailUrl: "https://i.ytimg.com/vi/PkZNo7MFNFg/mqdefault.jpg",
    categoryId: "programming",
    duration: "3:26:42",
  },
];

export const DEFAULT_EXPLORE_FILTER_ID: ExploreFilterId = "all";
