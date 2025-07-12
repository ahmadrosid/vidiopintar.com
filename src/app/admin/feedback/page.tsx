import { requireAdmin } from "@/lib/auth-admin";
import { FeedbackRepository } from "@/lib/db/repository";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, TrendingUp, Users, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AdminNavigation } from "@/components/admin/admin-navigation";

interface FeedbackWithUser {
  id: number;
  userId: string;
  type: string;
  rating: string;
  comment: string | null;
  metadata: any;
  createdAt: Date;
  user?: {
    name: string;
    email: string;
    image?: string;
  };
}

async function getFeedbackStats() {
  const allFeedback = await FeedbackRepository.getAll();
  
  const stats = {
    total: allFeedback.length,
    byRating: {
      love_it: allFeedback.filter(f => f.rating === 'love_it').length,
      decent: allFeedback.filter(f => f.rating === 'decent').length,
      bad: allFeedback.filter(f => f.rating === 'bad').length,
    },
    byType: {
      platform: allFeedback.filter(f => f.type === 'platform').length,
      video: allFeedback.filter(f => f.type === 'video').length,
      chat_response: allFeedback.filter(f => f.type === 'chat_response').length,
    },
    withComments: allFeedback.filter(f => f.comment && f.comment.trim().length > 0).length,
  };

  return { stats, feedback: allFeedback };
}

function getRatingEmoji(rating: string) {
  switch (rating) {
    case 'love_it': return '🧡';
    case 'decent': return '😐';
    case 'bad': return '😞';
    default: return '❓';
  }
}

function getRatingColor(rating: string) {
  switch (rating) {
    case 'love_it': return 'bg-green-100 text-green-800 border-green-200';
    case 'decent': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'bad': return 'bg-red-100 text-red-800 border-red-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

function getTypeColor(type: string) {
  switch (type) {
    case 'platform': return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'video': return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'chat_response': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}

export default async function AdminFeedbackPage() {
  await requireAdmin();

  const { stats, feedback } = await getFeedbackStats();

  return (
    <main className="bg-accent dark:bg-background min-h-screen">
      <div className="container max-w-6xl w-full mx-auto py-8 px-4">
        <AdminNavigation
          title="Feedback Analytics"
          description="User feedback insights for vidiopintar.com"
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
              <MessageCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                All feedback submissions
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Positive Rating</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.byRating.love_it}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total > 0 ? Math.round((stats.byRating.love_it / stats.total) * 100) : 0}% of total feedback
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">With Comments</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.withComments}</div>
              <p className="text-xs text-muted-foreground">
                {stats.total > 0 ? Math.round((stats.withComments / stats.total) * 100) : 0}% provided details
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.total > 0 
                  ? ((stats.byRating.love_it * 3 + stats.byRating.decent * 2 + stats.byRating.bad * 1) / stats.total).toFixed(1)
                  : '0.0'}
              </div>
              <p className="text-xs text-muted-foreground">
                Scale: 1 (bad) to 3 (love it)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Rating Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="text-lg">Rating Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🧡</span>
                  <span className="font-medium">Love it</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{stats.byRating.love_it}</span>
                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 rounded-full"
                      style={{ width: `${stats.total > 0 ? (stats.byRating.love_it / stats.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">😐</span>
                  <span className="font-medium">Decent</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{stats.byRating.decent}</span>
                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-500 rounded-full"
                      style={{ width: `${stats.total > 0 ? (stats.byRating.decent / stats.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">😞</span>
                  <span className="font-medium">Bad</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{stats.byRating.bad}</span>
                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-red-500 rounded-full"
                      style={{ width: `${stats.total > 0 ? (stats.byRating.bad / stats.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="text-lg">Feedback Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-medium">Platform</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{stats.byType.platform}</span>
                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${stats.total > 0 ? (stats.byType.platform / stats.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Video</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{stats.byType.video}</span>
                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${stats.total > 0 ? (stats.byType.video / stats.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-medium">Chat Response</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{stats.byType.chat_response}</span>
                  <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-indigo-500 rounded-full"
                      style={{ width: `${stats.total > 0 ? (stats.byType.chat_response / stats.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Feedback */}
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="text-lg">Recent Feedback</CardTitle>
          </CardHeader>
          <CardContent>
            {feedback.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No feedback received yet
              </div>
            ) : (
              <div className="space-y-4">
                {feedback.slice(0, 20).map((item) => (
                  <div key={item.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{getRatingEmoji(item.rating)}</span>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={getRatingColor(item.rating)}>
                              {item.rating.replace('_', ' ')}
                            </Badge>
                            <Badge variant="outline" className={getTypeColor(item.type)}>
                              {item.type.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            User ID: {item.userId.slice(0, 8)}... • {new Date(item.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    {item.comment && (
                      <div className="pl-8">
                        <p className="text-sm bg-muted p-3 rounded-md">{item.comment}</p>
                      </div>
                    )}
                    {item.metadata && (
                      <div className="pl-8">
                        <details className="text-xs text-muted-foreground">
                          <summary className="cursor-pointer hover:text-foreground">Metadata</summary>
                          <pre className="mt-2 bg-muted p-2 rounded text-xs overflow-auto">
                            {JSON.stringify(item.metadata, null, 2)}
                          </pre>
                        </details>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}