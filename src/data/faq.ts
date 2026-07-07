export interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export const faqData: FAQItem[] = [
  {
    question: "What is VidioPintar and how does it work?",
    answer: "VidioPintar is an AI YouTube summarizer that uses artificial intelligence to analyze video transcripts and extract key insights automatically. Simply paste any YouTube video URL, and our AI generates instant summaries, outlines, key takeaways, and actionable next steps. You can also chat with the video content to ask specific questions, request clarifications, or explore concepts in depth - transforming passive watching into active learning.",
    category: "Getting Started"
  },
  {
    question: "Can I use VidioPintar to summarize podcasts on YouTube?",
    answer: "Absolutely! VidioPintar excels at summarizing podcast content on YouTube. Whether it's a 2-hour interview or a daily news podcast, our AI extracts the key discussions, main arguments, and actionable insights so you can decide if it's worth your time to listen to the full episode.",
    category: "Use Cases"
  },
  {
    question: "How much does VidioPintar cost and what's included?",
    answer: "VidioPintar offers three plans: Free (2 videos/day with basic summaries), Monthly (IDR 50,000 for unlimited videos and advanced AI insights), and Yearly (IDR 500,000 - save 20%). Premium plans unlock unlimited video processing, advanced AI insights with deeper analysis, instant summaries, and priority email support - ideal for professionals, students, and content creators who learn from YouTube daily.",
    category: "Pricing"
  },
  {
    question: "What types of YouTube videos work with AI summarizers?",
    answer: "VidioPintar works best with educational content, tutorials, podcasts, lectures, business videos, and any informational content with clear spoken audio. The video must have a transcript available (most YouTube videos do). Our AI can process videos in English and Indonesian languages.",
    category: "Features"
  },
  {
    question: "Does Vidiopintar work on mobile phones?",
    answer: "Yes! VidioPintar is fully mobile-responsive and works on any device with a web browser - smartphones, tablets, or desktops. Access your video summaries, chat with AI, and browse your knowledge library from anywhere, making learning on-the-go seamless.",
    category: "Features"
  },
  {
    question: "Can I share AI-generated video summaries with others?",
    answer: "Yes, VidioPintar allows you to share your chat conversations and video insights via public links. This makes it perfect for study groups, team learning, content collaboration, or sharing key insights with colleagues and classmates.",
    category: "Features"
  },
  {
    question: "How accurate are AI video summaries?",
    answer: "VidioPintar uses advanced AI models from OpenAI and Google AI to ensure high accuracy in video summaries. The AI analyzes complete video transcripts to extract key points, main arguments, and actionable insights. While highly accurate for educational and informational content, we recommend using the chat feature to clarify or dive deeper into specific topics.",
    category: "Features"
  },
  {
    question: "Is my YouTube learning history private on Vidiopintar?",
    answer: "Your personal library and learning history are completely private by default. We only store video URLs, AI-generated summaries, and your chat conversations to build your knowledge base. You control what you share publicly through the sharing feature, and your data is never sold to third parties.",
    category: "Privacy & Security"
  },
];

export const faqCategories = [
  "Getting Started",
  "Features",
  "Use Cases",
  "Pricing",
  "Privacy & Security"
];
