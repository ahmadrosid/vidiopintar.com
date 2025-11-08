"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import { FeedbackModal } from "@/components/feedback/feedback-modal"
import { toast } from "sonner"
import { useTranslations } from 'next-intl'

export function ProfileFeedback() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const t = useTranslations('profile');

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

      toast.success(t('feedbackSuccess'))
    } catch (error) {
      console.error('Error submitting feedback:', error)
      throw error
    }
  }

  return (
    <>
      <div className="p-4 rounded-xs transition-all duration-200 bg-card hover:bg-card/50">
        <div className="space-y-3">
          <div className="space-y-1">
            <h2 className="text-lg font-semibold">{t('helpUsImprove')}</h2>
            <p className="text-sm text-muted-foreground">
              {t('helpUsImproveDesc')}
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="outline"
            size="sm"
          >
            <MessageCircle className="h-4 w-4 mr-2" />
            {t('giveFeedback')}
          </Button>
        </div>
      </div>

      <FeedbackModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFeedbackSubmit}
      />
    </>
  )
}