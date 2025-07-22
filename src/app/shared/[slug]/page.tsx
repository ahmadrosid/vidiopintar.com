import { notFound } from "next/navigation";
import { SharedVideoRepository } from "@/lib/db/repository";
import { Metadata } from "next";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ChatInterface } from "@/components/chat/chat-interface";
import { VideoPlayer } from "@/components/video/video-player";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SummarySection } from "@/components/video/summary-section";
import { TranscriptView } from "@/components/video/transcript-view";
import { getChatHistory } from "@/lib/storage";
import { fetchVideoTranscript } from "@/lib/youtube";
import { ChevronRight } from "lucide-react";
import { env } from "@/lib/env/server";

interface SharedVideoPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata(props: SharedVideoPageProps): Promise<Metadata> {
  const params = await props.params;
  const { slug } = params;

  const sharedVideo = await SharedVideoRepository.getBySlugWithDetails(slug);

  if (!sharedVideo) {
    return {
      title: "Video Not Found",
    };
  }

  return {
    title: `Vidiopintar - ${sharedVideo.title}`,
    description: sharedVideo.description || "Shared video from VidioPintar",
    openGraph: {
      title: sharedVideo.title,
      description: sharedVideo.description || "Shared video from VidioPintar",
      images: [{ url: sharedVideo.thumbnailUrl || "" }],
    },
  };
}

export default async function SharedVideoPage(props: SharedVideoPageProps) {
  const params = await props.params;
  const { slug } = params;

  const session = await auth.api.getSession({ headers: await headers() });
  const isLoggedIn = !!session?.user;
  const shareChatUrl = `${env.BETTER_AUTH_URL}/shared/${slug}`;
  const sharedVideo = await SharedVideoRepository.getBySlugWithDetails(slug);

  if (!sharedVideo || !sharedVideo.userVideoId) {
    notFound();
  }

  const transcript = await fetchVideoTranscript(sharedVideo.youtubeId);
  const messages = await getChatHistory(sharedVideo.youtubeId, sharedVideo.userVideoId);

  const quickStartQuestions: string[] = sharedVideo.quickStartQuestions || [];

  return (
    <main className="flex flex-col min-h-screen bg-melody-gradient relative">
      <div className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-7 min-h-screen">
          <div className="lg:col-span-4 h-full overflow-y-auto scrollbar-none relative">
            <div className="sticky top-0 z-50 bg-white dark:bg-black border-b">
              <div className="flex items-center p-4 gap-2">
                <a href="/home" className="text-foreground hover:underline hover:text-melody transition-colors inline-flex gap-2 items-center">
                  Home
                </a>
                <ChevronRight className="size-5 text-muted-foreground" />
                <h1 className="font-semibold tracking-tight flex-1 truncate">{sharedVideo.title}</h1>
              </div>
            </div>
            <VideoPlayer videoId={sharedVideo.youtubeId} />

            <div className="p-3">
              <Tabs defaultValue="summary" className="w-full">
                <TabsList>
                  <TabsTrigger value="summary">
                    <span className="flex items-center gap-2">Summary</span>
                  </TabsTrigger>
                  <TabsTrigger value="transcript">
                    <span className="flex items-center gap-2">Transcript</span>
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="summary" className="h-full overflow-y-auto p-0 m-0">
                  <SummarySection videoId={sharedVideo.youtubeId} initialSummary={sharedVideo.summary ?? ""} />
                </TabsContent>
                <TabsContent value="transcript" className="h-full overflow-y-auto p-0 m-0">
                  <TranscriptView transcript={transcript} />
                </TabsContent>
              </Tabs>
            </div>
          </div>

          <div className="lg:col-span-3 flex flex-col h-full md:h-auto relative">
            <ChatInterface
              videoId={sharedVideo.youtubeId}
              userVideoId={sharedVideo.userVideoId}
              initialMessages={messages}
              quickStartQuestions={quickStartQuestions}
              isSharePage={true}
              isLoggedIn={isLoggedIn}
              shareChatUrl={shareChatUrl}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
