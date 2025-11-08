"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertTriangle, Crown } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useTranslations } from 'next-intl';

interface VideoResult {
  id: string;
  title: string;
  description: string;
  thumbnails: Array<{
    url: string;
    width: number;
    height: number;
  }>;
  published: string;
  view_count: string;
  duration: string;
  author: {
    id: string;
    name: string;
  };
}

interface VideoSearchResultsProps {
  results: VideoResult[];
}

export function VideoSearchResults({ results }: VideoSearchResultsProps) {
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  const t = useTranslations('limitDialog');

  const handleAddVideo = async (videoId: string) => {
    setSubmittingId(videoId);
    
    try {
      const response = await fetch('/api/video/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ videoUrl: `https://www.youtube.com/watch?v=${videoId}` }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        if (result.errors) {
          const hasLimitError = result.errors.some((error: string) => 
            error.includes('daily limit') || error.includes('upgrade')
          );
          
          if (hasLimitError) {
            setShowLimitDialog(true);
          } else {
            result.errors.forEach((error: string) => {
              toast.error(error);
            });
          }
        } else {
          toast.error(result.error || 'An error occurred');
        }
        return;
      }
      
      // Success - redirect to video page
      if (result.videoId) {
        window.location.href = `/video/${result.videoId}`;
      } else {
        toast.success("Video submitted successfully!");
      }
      
    } catch (error) {
      console.error('Failed to add video:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {results.map((video, index) => (
          <Card key={`${video.id}-${index}`} className="overflow-hidden rounded-xs shadow-none border-none bg-card hover:bg-card/50 transition-all duration-200">
            <div className="aspect-video relative">
              <img 
                src={video.thumbnails[0]?.url} 
                alt={video.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                {video.duration}
              </div>
            </div>
            <div className="p-4 space-y-2">
              <h3 className="font-semibold line-clamp-2 text-sm">
                <a 
                  href={`https://www.youtube.com/watch?v=${video.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {video.title}
                </a>
              </h3>
              <p className="text-xs text-muted-foreground">{video.author.name}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{video.view_count}</span>
                <span>{video.published}</span>
              </div>
              <Button 
                onClick={() => handleAddVideo(video.id)}
                disabled={submittingId === video.id}
                className="w-full"
                size="sm"
              >
                {submittingId === video.id ? t('processing') : t('chatWithVideo')}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Plan Limit Dialog */}
      <Dialog open={showLimitDialog} onOpenChange={setShowLimitDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-full">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <DialogTitle>{t('title')}</DialogTitle>
            </div>
          </DialogHeader>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('description')}
            </p>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-sm">{t('premiumBenefits')}</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• {t('benefits.unlimited')}</li>
                <li>• {t('benefits.ai')}</li>
                <li>• {t('benefits.support')}</li>
                <li>• {t('benefits.features')}</li>
              </ul>
            </div>
          </div>
          
          <DialogFooter className="flex gap-2 sm:gap-2">
            <Button 
              variant="outline" 
              onClick={() => setShowLimitDialog(false)}
              className="flex-1"
            >
              {t('waitTomorrow')}
            </Button>
            <Link href="/profile/billing" className="flex-1">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Crown className="w-4 h-4 mr-2" />
                {t('upgradeNow')}
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}