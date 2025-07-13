"use client"

import { useState } from "react"
import { MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

type FeedbackRating = 'bad' | 'decent' | 'love_it'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit?: (rating: FeedbackRating, comment?: string) => Promise<void>
  context?: {
    type: 'chat_response' | 'video' | 'platform'
    title?: string
    description?: string
  }
}

const ratingOptions = [
  { value: 'bad' as const, emoji: '😞', label: 'Bad' },
  { value: 'decent' as const, emoji: '😐', label: 'Decent' },
  { value: 'love_it' as const, emoji: '🧡', label: 'Love it' },
]

export function FeedbackModal({ isOpen, onClose, onSubmit, context }: FeedbackModalProps) {
  const [selectedRating, setSelectedRating] = useState<FeedbackRating | null>(null)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async () => {
    if (!selectedRating) {
      toast.error('Please select a rating')
      return
    }

    setIsSubmitting(true)
    try {
      if (onSubmit) {
        await onSubmit(selectedRating, comment.trim() || undefined)
      }
      setIsSubmitted(true)
    } catch (error) {
      toast.error('Failed to submit feedback')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setSelectedRating(null)
    setComment('')
    setIsSubmitted(false)
    onClose()
  }

  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <div className="text-center">
            <div className="py-6">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Thank you</h3>
              <p className="text-muted-foreground text-sm mb-6">
                The feedback helps us improve, appreciate the time you took to send us the feedback!
              </p>
            </div>
            <Button onClick={handleClose} className="w-full bg-green-600 hover:bg-green-700">
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="relative">
          <h2 className="text-lg font-semibold">
            {context?.type === 'chat_response' ? 'Rate this response' : 'Rate your experience'}
          </h2>
          {context?.title && (
            <p className="text-sm text-muted-foreground mt-1">{context.title}</p>
          )}
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex gap-3">
            {ratingOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedRating(option.value)}
                className={`flex-1 p-3 rounded-lg border transition-all cursor-pointer ${selectedRating === option.value
                    ? 'border-green-600 bg-green-50 dark:bg-green-950'
                    : 'border-border hover:border-muted-foreground'
                  }`}
              >
                <div className="text-2xl mb-1">{option.emoji}</div>
                <div className="text-sm font-medium">{option.label}</div>
              </button>
            ))}
          </div>

          <Textarea
            placeholder={
              context?.type === 'chat_response' 
                ? "What could be improved in this response? (optional)" 
                : "Tell us more (optional)"
            }
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="min-h-[100px] resize-none"
          />

          <Button
            onClick={handleSubmit}
            disabled={!selectedRating || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? 'Submitting...' : 'Submit your feedback'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
