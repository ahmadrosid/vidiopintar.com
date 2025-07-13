"use client"

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FeedbackCard } from "@/components/admin/feedback-card";
import { FeedbackFilters } from "@/components/admin/feedback-filters";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface FeedbackItem {
  id: number;
  userId: string;
  type: string;
  rating: string;
  comment: string | null;
  metadata: any;
  createdAt: Date;
}

interface FeedbackListProps {
  feedback: FeedbackItem[];
  onFeedbackDeleted?: (id: number) => void;
}

export function FeedbackList({ feedback, onFeedbackDeleted }: FeedbackListProps) {
  const [filters, setFilters] = useState({
    type: null as string | null,
    rating: null as string | null,
    search: "",
    sortBy: "newest"
  });
  const [feedbackToDelete, setFeedbackToDelete] = useState<FeedbackItem | null>(null);

  const handleDeleteClick = (id: number) => {
    const feedbackItem = feedback.find(item => item.id === id);
    if (feedbackItem) {
      setFeedbackToDelete(feedbackItem);
    }
  };

  const handleConfirmDelete = async () => {
    if (!feedbackToDelete) return;

    try {
      const response = await fetch(`/api/feedback?id=${feedbackToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete feedback');
      }

      toast.success("Feedback deleted successfully");
      onFeedbackDeleted?.(feedbackToDelete.id);
      setFeedbackToDelete(null);
    } catch (error) {
      toast.error("Failed to delete feedback. Please try again.");
      setFeedbackToDelete(null);
    }
  };

  const filteredAndSortedFeedback = useMemo(() => {
    let result = [...feedback];

    // Apply filters
    if (filters.type) {
      result = result.filter(item => item.type === filters.type);
    }

    if (filters.rating) {
      result = result.filter(item => item.rating === filters.rating);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(item => {
        const commentMatch = item.comment?.toLowerCase().includes(searchLower);
        const metadataMatch = JSON.stringify(item.metadata || {}).toLowerCase().includes(searchLower);
        const userIdMatch = item.userId.toLowerCase().includes(searchLower);
        const typeMatch = item.type.toLowerCase().includes(searchLower);
        const ratingMatch = item.rating.toLowerCase().includes(searchLower);
        
        return commentMatch || metadataMatch || userIdMatch || typeMatch || ratingMatch;
      });
    }

    // Apply sorting
    switch (filters.sortBy) {
      case "oldest":
        result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "rating_high":
        result.sort((a, b) => {
          const ratingOrder = { 'love_it': 3, 'decent': 2, 'bad': 1 };
          return (ratingOrder[b.rating as keyof typeof ratingOrder] || 0) - (ratingOrder[a.rating as keyof typeof ratingOrder] || 0);
        });
        break;
      case "rating_low":
        result.sort((a, b) => {
          const ratingOrder = { 'love_it': 3, 'decent': 2, 'bad': 1 };
          return (ratingOrder[a.rating as keyof typeof ratingOrder] || 0) - (ratingOrder[b.rating as keyof typeof ratingOrder] || 0);
        });
        break;
      case "type":
        result.sort((a, b) => a.type.localeCompare(b.type));
        break;
      case "newest":
      default:
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return result;
  }, [feedback, filters]);

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="text-lg">Recent Feedback</CardTitle>
        <FeedbackFilters
          onFilterChange={setFilters}
          totalCount={feedback.length}
          filteredCount={filteredAndSortedFeedback.length}
        />
      </CardHeader>
      <CardContent>
        {feedback.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No feedback received yet
          </div>
        ) : filteredAndSortedFeedback.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No feedback matches your current filters
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedFeedback.slice(0, 50).map((item) => (
              <FeedbackCard key={item.id} feedback={item} onDelete={handleDeleteClick} />
            ))}
            {filteredAndSortedFeedback.length > 50 && (
              <div className="text-center py-4 text-muted-foreground text-sm">
                Showing first 50 results. Use filters to narrow down results.
              </div>
            )}
          </div>
        )}
      </CardContent>

      <AlertDialog open={!!feedbackToDelete} onOpenChange={() => setFeedbackToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Feedback</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this {feedbackToDelete?.type.replace('_', ' ')} feedback? 
              {feedbackToDelete?.comment && " The user's comment will be permanently removed."}
              This action is permanent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete Feedback
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}