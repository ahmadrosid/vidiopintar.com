import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageCircle, Video, Monitor, ExternalLink, Play, Trash2 } from "lucide-react";

interface FeedbackItem {
  id: number;
  userId: string;
  type: string;
  rating: string;
  comment: string | null;
  metadata: any;
  createdAt: Date;
}

interface FeedbackCardProps {
  feedback: FeedbackItem;
  onDelete?: (id: number) => void;
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
    case 'love_it': return 'bg-green-50 text-green-700 border-green-100 dark:bg-green-950/30 dark:text-green-300 dark:border-green-900';
    case 'decent': return 'bg-orange-50 text-orange-700 border-orange-100 dark:bg-orange-950/30 dark:text-orange-300 dark:border-orange-900';
    case 'bad': return 'bg-red-50 text-red-700 border-red-100 dark:bg-red-950/30 dark:text-red-300 dark:border-red-900';
    default: return 'bg-gray-50 text-gray-700 border-gray-100 dark:bg-gray-950/30 dark:text-gray-300 dark:border-gray-900';
  }
}

function formatTimeAgo(date: Date) {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  
  return date.toLocaleDateString();
}

function ChatResponseCard({ feedback, onDelete }: { feedback: FeedbackItem; onDelete?: (id: number) => void }) {
  const videoTitle = feedback.metadata?.videoTitle || feedback.metadata?.videoId || "Unknown Video";
  const videoId = feedback.metadata?.videoId;
  const messageContent = feedback.metadata?.messageContent || "";
  const responseLength = feedback.metadata?.responseLength || 0;

  return (
    <div className="border-l-4 border-l-blue-200 bg-white p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">{getRatingEmoji(feedback.rating)}</span>
            <span className="font-medium">{feedback.rating.replace('_', ' ')}</span>
            <span className="text-xs text-gray-500">• Chat Response</span>
          </div>
          <div className="text-sm text-gray-600 mt-1">Video: {videoTitle}</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{formatTimeAgo(feedback.createdAt)}</span>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(feedback.id)}
              className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* AI Response Content - The core message that was rated */}
      {messageContent && (
        <div className="bg-blue-50 p-3 rounded border border-blue-100">
          <div className="text-xs text-blue-600 font-medium mb-1">AI Response:</div>
          <div className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">
            {messageContent.length > 300 
              ? `${messageContent.substring(0, 300)}...` 
              : messageContent
            }
          </div>
          {responseLength > 0 && (
            <div className="text-xs text-gray-500 mt-2">{responseLength} characters</div>
          )}
        </div>
      )}

      {/* User's feedback comment */}
      {feedback.comment && (
        <div className="text-sm text-gray-800 bg-gray-50 p-2 rounded border-l-2 border-gray-200">
          <div className="text-xs text-gray-600 font-medium mb-1">User feedback:</div>
          "{feedback.comment}"
        </div>
      )}

      {videoId && (
        <div className="pt-1">
          <a 
            href={`/video/${videoId}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline"
          >
            View Video →
          </a>
        </div>
      )}
    </div>
  );
}

function VideoCard({ feedback, onDelete }: { feedback: FeedbackItem; onDelete?: (id: number) => void }) {
  const videoTitle = feedback.metadata?.videoTitle || "Unknown Video";
  const videoId = feedback.metadata?.videoId;

  return (
    <div className="border-l-4 border-l-purple-200 bg-white p-4 space-y-2">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">{getRatingEmoji(feedback.rating)}</span>
            <span className="font-medium">{feedback.rating.replace('_', ' ')}</span>
            <span className="text-xs text-gray-500">• Video</span>
          </div>
          <div className="text-sm text-gray-600 mt-1">{videoTitle}</div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{formatTimeAgo(feedback.createdAt)}</span>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(feedback.id)}
              className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {feedback.comment && (
        <div className="text-sm text-gray-800 bg-gray-50 p-2 rounded border-l-2 border-gray-200">
          "{feedback.comment}"
        </div>
      )}

      {videoId && (
        <div className="pt-1">
          <a 
            href={`/video/${videoId}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline"
          >
            View Video →
          </a>
        </div>
      )}
    </div>
  );
}

function PlatformCard({ feedback, onDelete }: { feedback: FeedbackItem; onDelete?: (id: number) => void }) {
  const page = feedback.metadata?.page || "Platform";

  return (
    <div className="border-l-4 border-l-green-200 bg-white p-4 space-y-2">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-lg">{getRatingEmoji(feedback.rating)}</span>
            <span className="font-medium">{feedback.rating.replace('_', ' ')}</span>
            <span className="text-xs text-gray-500">• {page}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{formatTimeAgo(feedback.createdAt)}</span>
          {onDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(feedback.id)}
              className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {feedback.comment && (
        <div className="text-sm text-gray-800 bg-gray-50 p-2 rounded border-l-2 border-gray-200">
          "{feedback.comment}"
        </div>
      )}
    </div>
  );
}

export function FeedbackCard({ feedback, onDelete }: FeedbackCardProps) {
  switch (feedback.type) {
    case 'chat_response':
      return <ChatResponseCard feedback={feedback} onDelete={onDelete} />;
    case 'video':
      return <VideoCard feedback={feedback} onDelete={onDelete} />;
    case 'platform':
      return <PlatformCard feedback={feedback} onDelete={onDelete} />;
    default:
      // Fallback to original design for unknown types
      return (
        <div className="border rounded-lg p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xl">{getRatingEmoji(feedback.rating)}</span>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={getRatingColor(feedback.rating)}>
                    {feedback.rating.replace('_', ' ')}
                  </Badge>
                  <Badge variant="outline">
                    {feedback.type.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  User ID: {feedback.userId.slice(0, 8)}... • {new Date(feedback.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground">
                {new Date(feedback.createdAt).toLocaleTimeString()}
              </p>
              {onDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(feedback.id)}
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
          {feedback.comment && (
            <div className="pl-8">
              <p className="text-sm bg-muted p-3 rounded-md">{feedback.comment}</p>
            </div>
          )}
        </div>
      );
  }
}