"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import { FeedbackModal } from "@/components/feedback/feedback-modal"
import { toast } from "sonner"

export function ProfileFeedback() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleFeedbackSubmit = async (rating: 'bad' | 'decent' | 'love_it', comment?: string) => {
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'platform',
          rating,
          comment,
          metadata: {
            page: 'profile',
            userAgent: navigator.userAgent,
          }
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to submit feedback')
      }

      toast.success('Thank you for your feedback!')
    } catch (error) {
      console.error('Error submitting feedback:', error)
      throw error
    }
  }

  return (
    <>
      <Card className="shadow-none">
        <CardContent className="px-4 md:px-6 py-4 md:py-6">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Help us improve</h2>
              <p className="text-sm text-muted-foreground">
                Share your experience to help us make the platform better
              </p>
            </div>
            <Button
              onClick={() => setIsModalOpen(true)}
              variant="outline"
              size="sm"
              className="ml-4 flex-shrink-0"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Give feedback
            </Button>
          </div>
        </CardContent>
      </Card>

      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFeedbackSubmit}
      />
    </>
  )
}