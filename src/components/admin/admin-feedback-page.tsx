"use client"

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle, TrendingUp, Users, Star } from "lucide-react";
import { AdminNavigation } from "@/components/admin/admin-navigation";
import { FeedbackList } from "@/components/admin/feedback-list";

interface FeedbackItem {
  id: number;
  userId: string;
  type: string;
  rating: string;
  comment: string | null;
  metadata: any;
  createdAt: Date;
}

interface FeedbackStats {
  total: number;
  byRating: {
    love_it: number;
    decent: number;
    bad: number;
  };
  byType: {
    platform: number;
    video: number;
    chat_response: number;
  };
  withComments: number;
}

interface AdminFeedbackPageProps {
  initialFeedback: FeedbackItem[];
  initialStats: FeedbackStats;
}

function calculateStats(feedback: FeedbackItem[]): FeedbackStats {
  return {
    total: feedback.length,
    byRating: {
      love_it: feedback.filter(f => f.rating === 'love_it').length,
      decent: feedback.filter(f => f.rating === 'decent').length,
      bad: feedback.filter(f => f.rating === 'bad').length,
    },
    byType: {
      platform: feedback.filter(f => f.type === 'platform').length,
      video: feedback.filter(f => f.type === 'video').length,
      chat_response: feedback.filter(f => f.type === 'chat_response').length,
    },
    withComments: feedback.filter(f => f.comment && f.comment.trim().length > 0).length,
  };
}

export function AdminFeedbackPage({ initialFeedback, initialStats }: AdminFeedbackPageProps) {
  const [feedback, setFeedback] = useState(initialFeedback);
  const [stats, setStats] = useState(initialStats);

  const handleFeedbackDeleted = (deletedId: number) => {
    const updatedFeedback = feedback.filter(f => f.id !== deletedId);
    setFeedback(updatedFeedback);
    setStats(calculateStats(updatedFeedback));
  };

  return (
    <main className="bg-accent dark:bg-background min-h-screen">
      <div className="container max-w-[1328px] w-full mx-auto py-8 px-4">
        <AdminNavigation
          title="Feedback Analytics"
          description="User feedback insights for vidiopintar.com"
        />

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="rounded-xs border-t-3 border-card hover:border-accent transition hover:bg-card/85 shadow-[0px_4px_12px_rgba(0,0,0,0.08)]">
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

          <Card className="rounded-xs border-t-3 border-card hover:border-accent transition hover:bg-card/85 shadow-[0px_4px_12px_rgba(0,0,0,0.08)]">
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

          <Card className="rounded-xs border-t-3 border-card hover:border-accent transition hover:bg-card/85 shadow-[0px_4px_12px_rgba(0,0,0,0.08)]">
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

          <Card className="rounded-xs border-t-3 border-card hover:border-accent transition hover:bg-card/85 shadow-[0px_4px_12px_rgba(0,0,0,0.08)]">
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
          <Card className="rounded-xs shadow-[0px_4px_12px_rgba(0,0,0,0.08)]">
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

          <Card className="rounded-xs shadow-[0px_4px_12px_rgba(0,0,0,0.08)]">
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

        {/* Feedback List */}
        <FeedbackList feedback={feedback} onFeedbackDeleted={handleFeedbackDeleted} />
      </div>
    </main>
  );
}