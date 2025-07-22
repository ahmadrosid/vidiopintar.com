import { requireAdmin } from "@/lib/auth-admin";
import { getUserActivityDetails } from "@/lib/cost-admin-queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, DollarSign, MessageSquare, Video, Zap, Calendar } from "lucide-react";
import { AdminNavigation } from "@/components/admin/admin-navigation";
import { Markdown } from "@/components/ui/markdown";
import Link from "next/link";

interface UserDetailPageProps {
  params: Promise<{
    userId: string;
  }>;
}

export default async function UserDetailPage(props: UserDetailPageProps) {
  const params = await props.params;
  await requireAdmin();

  const { user, videos, conversations } = await getUserActivityDetails(params.userId);

  return (
    <main className="bg-accent dark:bg-background">
      <div className="container max-w-6xl w-full mx-auto py-8 px-4">
        <div className="mb-6">
          <Link href="/admin/cost">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cost Analytics
            </Button>
          </Link>
          
          <AdminNavigation
            title={`User Activity: ${user.name || 'Anonymous'}`}
            description={`Detailed activity and cost breakdown for ${user.email}`}
          />
        </div>

        {/* User Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${user.totalCost.toFixed(4)}</div>
              <p className="text-xs text-muted-foreground">
                LLM usage cost
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Videos</CardTitle>
              <Video className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.videoCount}</div>
              <p className="text-xs text-muted-foreground">
                Videos processed
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Messages</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.messageCount}</div>
              <p className="text-xs text-muted-foreground">
                Chat messages
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tokens</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.totalTokens.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Total tokens used
              </p>
            </CardContent>
          </Card>
        </div>

        {/* User Videos */}
        <Card className="shadow-none mb-8">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">User Videos ({videos.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Video</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Messages</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Tokens</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Cost</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Added</th>
                  </tr>
                </thead>
                <tbody>
                  {videos.map((video) => (
                    <tr key={video.id} className="border-b hover:bg-accent/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={video.thumbnailUrl}
                            alt={video.title}
                            className="w-16 h-9 object-cover rounded"
                          />
                          <div>
                            <div className="font-medium text-sm line-clamp-2">{video.title}</div>
                            <div className="text-xs text-muted-foreground">{video.channelTitle}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-sm">{video.messageCount}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-sm">{video.totalTokens.toLocaleString()}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-sm font-medium">${video.totalCost.toFixed(4)}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-xs text-muted-foreground">
                          {video.addedAt.toLocaleDateString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {videos.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No videos found for this user
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Conversations */}
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Recent Conversations (Last 100)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {conversations.map((message) => (
                <div key={message.id} className={`border rounded-lg p-4 ${
                  message.role === 'user' 
                    ? 'bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800' 
                    : 'bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800'
                }`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        message.role === 'user' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {message.role}
                      </span>
                      <span className="text-sm text-muted-foreground">{message.videoTitle}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      {message.totalTokens > 0 && (
                        <span>{message.totalTokens.toLocaleString()} tokens</span>
                      )}
                      {message.totalCost > 0 && (
                        <span>${message.totalCost.toFixed(4)}</span>
                      )}
                      <span>{message.createdAt.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <Markdown>{message.content}</Markdown>
                  </div>
                </div>
              ))}
              
              {conversations.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  No conversations found for this user
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}