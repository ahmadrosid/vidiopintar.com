"use client"

import { useState } from "react"
import { ThumbsUp, ThumbsDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { FeedbackModal } from "@/components/feedback/feedback-modal"
import { toast } from "sonner"

interface FeedbackButtonsProps {
  messageId: string
  videoId: string
  messageContent: string
  feedbackState?: { rating: string; hasSubmitted: boolean }
  onFeedbackSubmitted: (messageId: string, rating: string) => void
}

type FeedbackRating = 'bad' | 'decent' | 'love_it'

export function FeedbackButtons({ messageId, videoId, messageContent, feedbackState, onFeedbackSubmitted }: FeedbackButtonsProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleQuickFeedback = async (rating: FeedbackRating) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'chat_response',
          rating,
          metadata: {
            messageId,
            videoId,
            messageContent,
            responseLength: messageContent.length,
            userAgent: navigator.userAgent,
          }
        }),
      })

      if (!response.ok) {
        if (response.status === 409) {
          onFeedbackSubmitted(messageId, rating)
          toast.info('Feedback already submitted for this response')
          return
        }
        throw new Error('Failed to submit feedback')
      }

      onFeedbackSubmitted(messageId, rating)
      toast.success('Thanks for your feedback!')
    } catch (error) {
      console.error('Error submitting feedback:', error)
      toast.error('Failed to submit feedback')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDetailedFeedback = async (rating: FeedbackRating, comment?: string) => {
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'chat_response',
          rating,
          comment,
          metadata: {
            messageId,
            videoId,
            messageContent,
            responseLength: messageContent.length,
            userAgent: navigator.userAgent,
          }
        }),
      })

      if (!response.ok) {
        if (response.status === 409) {
          onFeedbackSubmitted(messageId, rating)
          toast.info('Feedback already submitted for this response')
          return
        }
        throw new Error('Failed to submit feedback')
      }

      onFeedbackSubmitted(messageId, rating)
      toast.success('Thanks for your detailed feedback!')
    } catch (error) {
      console.error('Error submitting feedback:', error)
      throw error
    }
  }

  const handleThumbsUp = () => {
    if (!feedbackState?.hasSubmitted) {
      handleQuickFeedback('love_it')
    }
  }

  const handleThumbsDown = () => {
    if (!feedbackState?.hasSubmitted) {
      setIsModalOpen(true)
    }
  }

  // If feedback has been submitted, show confirmation state
  if (feedbackState?.hasSubmitted) {
    const getRatingEmoji = (rating: string) => {
      switch (rating) {
        case 'love_it': return '🧡';
        case 'decent': return '😐';
        case 'bad': return '😞';
        default: return '✓';
      }
    }

    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>{getRatingEmoji(feedbackState.rating)}</span>
        <span>Feedback submitted</span>
      </div>
    )
  }

  return (
    <>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 hover:bg-green-100 hover:text-green-600 dark:hover:bg-green-900 dark:hover:text-green-400"
          onClick={handleThumbsUp}
          disabled={isSubmitting}
          title="This response was helpful"
        >
          <ThumbsUp className="h-3 w-3" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900 dark:hover:text-red-400"
          onClick={handleThumbsDown}
          disabled={isSubmitting}
          title="This response needs improvement"
        >
          <ThumbsDown className="h-3 w-3" />
        </Button>
      </div>

      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleDetailedFeedback}
        context={{
          type: 'chat_response',
          title: 'Help us improve this AI response',
          description: 'Your feedback helps us provide better answers'
        }}
      />
    </>
  )
}