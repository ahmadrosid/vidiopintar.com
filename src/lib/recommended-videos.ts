export type RecommendedVideo = {
  youtubeId: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  duration?: string;
};

export const RECOMMENDED_VIDEOS: RecommendedVideo[] = [
  {
    youtubeId: "bSDprg24pEA",
    title: "How To Learn Any Skill So Fast It Feels Illegal",
    channelTitle: "Justin Sung",
    thumbnailUrl: "https://i.ytimg.com/vi/bSDprg24pEA/mqdefault.jpg",
  },
  {
    youtubeId: "meMJdfytNI0",
    title: "How to Start a YouTube Channel - Beginners Guide (2026)",
    channelTitle: "Ali Abdaal",
    thumbnailUrl: "https://i.ytimg.com/vi/meMJdfytNI0/mqdefault.jpg",
  },
  {
    youtubeId: "lxpaSlImFHk",
    title: "How to Start a SaaS Business From Scratch",
    channelTitle: "Dan Martell",
    thumbnailUrl: "https://i.ytimg.com/vi/lxpaSlImFHk/mqdefault.jpg",
  },
  {
    youtubeId: "UNzCG3lw6O0",
    title: "Building Great Agent Skills: The Missing Manual",
    channelTitle: "Matt Gray",
    thumbnailUrl: "https://i.ytimg.com/vi/UNzCG3lw6O0/mqdefault.jpg",
  },
];

