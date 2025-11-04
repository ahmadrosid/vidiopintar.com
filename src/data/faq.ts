export interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

export const faqData: FAQItem[] = [
  // Core Product Questions (High Search Volume)
  {
    question: "What is VidioPintar and how does it work?",
    answer: "VidioPintar is an AI YouTube summarizer that uses artificial intelligence to analyze video transcripts and extract key insights automatically. Simply paste any YouTube video URL, and our AI generates instant summaries, outlines, key takeaways, and actionable next steps. You can also chat with the video content to ask specific questions, request clarifications, or explore concepts in depth - transforming passive watching into active learning.",
    category: "Getting Started"
  },
  {
    question: "Is there a free plan available?",
    answer: "Yes, VidioPintar offers a free plan that lets you process up to 2 YouTube videos per day with AI-powered summaries and basic insights. It's perfect for students, professionals, and anyone who wants to learn faster from YouTube content without commitment.",
    category: "Getting Started"
  },

  // Use Case Questions (Long-tail Keywords)
  {
    question: "Can I use VidioPintar to summarize podcasts on YouTube?",
    answer: "Absolutely! VidioPintar excels at summarizing podcast content on YouTube. Whether it's a 2-hour interview or a daily news podcast, our AI extracts the key discussions, main arguments, and actionable insights so you can decide if it's worth your time to listen to the full episode.",
    category: "Use Cases"
  },
  {
    question: "How can students use AI to learn from educational YouTube videos?",
    answer: "Students use VidioPintar to create instant study notes from lecture recordings, educational tutorials, and explainer videos. The AI generates summaries, outlines, and key concepts that you can review before exams. Plus, the chat feature helps clarify difficult topics by letting you ask follow-up questions about the video content.",
    category: "Use Cases"
  },
  {
    question: "What's the best tool to organize and save YouTube learning videos?",
    answer: "VidioPintar includes a personal knowledge library where you can save and organize YouTube videos by topics like Productivity, Marketing, Mental Health, History, and more. Every saved video includes AI-generated summaries and your chat history, creating a searchable knowledge base from all the content you've learned.",
    category: "Use Cases"
  },

  // Pricing & Value Questions
  {
    question: "How much does VidioPintar cost and what's included?",
    answer: "VidioPintar offers three plans: Free (2 videos/day with basic summaries), Monthly (IDR 50,000 for unlimited videos and advanced AI insights), and Yearly (IDR 500,000 - save 20%). Premium plans unlock unlimited video processing, advanced AI insights with deeper analysis, instant summaries, and priority email support - ideal for professionals, students, and content creators who learn from YouTube daily.",
    category: "Pricing"
  },

  // Technical & Capability Questions
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

  // Privacy & Trust Questions
  {
    question: "Is my YouTube learning history private on Vidiopintar?",
    answer: "Your personal library and learning history are completely private by default. We only store video URLs, AI-generated summaries, and your chat conversations to build your knowledge base. You control what you share publicly through the sharing feature, and your data is never sold to third parties.",
    category: "Privacy & Security"
  },
  {
    question: "How accurate are AI video summaries?",
    answer: "VidioPintar uses advanced AI models from OpenAI and Google AI to ensure high accuracy in video summaries. The AI analyzes complete video transcripts to extract key points, main arguments, and actionable insights. While highly accurate for educational and informational content, we recommend using the chat feature to clarify or dive deeper into specific topics.",
    category: "Privacy & Security"
  },

  // Comparison & Alternative Questions
  {
    question: "Do I need to watch YouTube videos if I use Vidiopintar?",
    answer: "Not necessarily! VidioPintar provides comprehensive summaries, outlines, and key takeaways so you can understand the main points without watching. However, if a video seems particularly interesting based on the summary, you can always watch it. Think of it as a smart filter for your YouTube learning time.",
    category: "Getting Started"
  }
];

export const faqCategories = [
  "Getting Started",
  "Features",
  "Use Cases",
  "Pricing",
  "Privacy & Security"
];
