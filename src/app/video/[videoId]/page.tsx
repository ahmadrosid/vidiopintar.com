import { fetchVideoDetails, fetchVideoTranscript, generateQuickStartQuestions } from "@/lib/youtube"
import { VideoPlayer } from "@/components/video/video-player"
import { getChatHistory } from "@/lib/storage"
import { TranscriptView } from "@/components/video/transcript-view"
import { CommentsView } from "@/components/video/comments-view"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronRight } from "lucide-react"
import { ChatInterface } from "@/components/chat/chat-interface"
import { SummarySection } from "@/components/video/summary-section"
import { getCurrentUser } from "@/lib/auth"
import { TipsAlert } from "@/components/chat/tips-alert"
import { LanguageSelector } from "@/components/language-selector"
import { UserRepository } from "@/lib/db/repository"

export default async function VideoPage(props: { params: Promise<{ videoId: string }> }) {
  const params = await props.params;
  const user = await getCurrentUser();
  const { videoId } = params;

  // Get user's language preference from database
  let userLanguage: 'en' | 'id' = 'en';
  try {
    const savedLanguage = await UserRepository.getPreferredLanguage(user.id);
    if (savedLanguage === 'en' || savedLanguage === 'id') {
      userLanguage = savedLanguage;
    }
  } catch (error) {
    console.log('Could not get user language preference, using default:', error);
  }

  let videoDetails = await fetchVideoDetails(videoId);
  let transcript = await fetchVideoTranscript(videoId);
  let messages: any[] = [];
  let quickStartQuestions: string[] = [];

  // If transcript is not available, show error state
  if (transcript.error) {
    return (
      <main className="flex flex-col min-h-screen bg-melody-gradient relative">
        <div className="relative z-10">
          <div className="min-h-screen flex items-center justify-center p-4">
            <div className="max-w-md mx-auto text-center space-y-6">
              <div className="space-y-3">
                <h1 className="text-2xl font-bold text-foreground">Video Not Supported</h1>
                <p className="text-muted-foreground leading-relaxed">
                  {transcript.errorMessage || "This video doesn't have a transcript available, which is required for our chat functionality."}
                </p>
              </div>
              
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Please try a different video that has captions or subtitles enabled. Note that we don't support live streaming YouTube videos.
                </p>
                <a 
                  href="/home" 
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  Back to Home
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!videoDetails.userVideo) {
    videoDetails.userVideo = transcript.userVideo;
  } else {
    messages = await getChatHistory(videoId, videoDetails.userVideo.id);
    quickStartQuestions = videoDetails.userVideo.quickStartQuestions ?? [];
  }

  if (quickStartQuestions.length === 0 && videoDetails.userVideo?.summary) {
    quickStartQuestions = await generateQuickStartQuestions(
      `${videoDetails.title}\n${videoDetails.description}\nSummary: \n${videoDetails.userVideo.summary}`,
      videoDetails.userVideo.id,
      videoId
    );
  }

  return (
    <main className="flex flex-col min-h-screen bg-melody-gradient relative">
      <div className="relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-7 h-screen">
          <div className="lg:col-span-4 h-full overflow-y-auto scrollbar-none relative">
            <div className="sticky top-0 z-50 bg-white dark:bg-black border-b">
              <div className="flex items-center p-2.5 gap-2">
                <a href="/home" className="text-foreground hover:underline hover:text-melody transition-colors inline-flex gap-2 items-center">
                  Home
                </a>
                <ChevronRight className="size-5 text-muted-foreground" />
                <h1 className="font-semibold tracking-tight flex-1 truncate">{videoDetails.title}</h1>
                <LanguageSelector defaultLanguage={userLanguage} />
              </div>
            </div>

            <VideoPlayer videoId={videoId} />

            <div className="relative">
              <Tabs defaultValue="summary" className="w-full p-3">
                <TabsList>
                  <TabsTrigger
                    value="summary"
                  >
                    <span className="flex items-center gap-2">
                      Summary
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="transcript"
                  >
                    <span className="flex items-center gap-2">
                      Transcript
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="comments"
                  >
                    <span className="flex items-center gap-2">
                      Top comments
                    </span>
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="summary" className="h-full overflow-y-auto p-0 m-0">
                  <SummarySection videoId={videoId} initialSummary={videoDetails.userVideo?.summary ?? ""} />
                </TabsContent>
                <TabsContent value="transcript" className="h-full overflow-y-auto p-0 m-0">
                  <TranscriptView transcript={transcript} />
                </TabsContent>
                <TabsContent value="comments" className="h-full overflow-y-auto p-0 m-0">
                  <CommentsView videoId={videoId} />
                </TabsContent>
              </Tabs>
              <TipsAlert videoId={videoId} />
            </div>
          </div>
          <div className="lg:col-span-3 flex flex-col h-full md:h-auto relative">
            {videoDetails.userVideo ? (
              <ChatInterface
                videoId={videoId}
                userVideoId={videoDetails.userVideo.id}
                initialMessages={messages}
                quickStartQuestions={quickStartQuestions} />
            ) : (
              <div className="p-4 text-center h-screen h-screen-dvh w-full">
                <p className="text-muted-foreground">Unable to load chat interface. Video details are incomplete.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

