"use client";

import { useEffect, useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Crown, Clock, AlertTriangle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

interface PlanUsageNotificationProps {
  userId?: string;
}

interface UsageStats {
  currentPlan: 'free' | 'monthly' | 'yearly';
  unlimited: boolean;
  videosUsedToday: number;
  dailyLimit: number;
}

export function PlanUsageNotification({ userId }: PlanUsageNotificationProps) {
  const [usageStats, setUsageStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const t = useTranslations('planUsage');

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchUsageStats = async () => {
      try {
        const response = await fetch(`/api/user/usage-stats`);
        if (response.ok) {
          const stats = await response.json();
          setUsageStats(stats);
        }
      } catch (error) {
        console.error('Failed to fetch usage stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsageStats();
  }, [userId]);

  if (loading || !usageStats || !userId) {
    return null;
  }

  // Don't show notification for unlimited plans
  if (usageStats.unlimited) {
    return null;
  }

  // Show warning when approaching limit (80% or more used)
  const usagePercentage = (usageStats.videosUsedToday / usageStats.dailyLimit) * 100;
  const isNearLimit = usagePercentage >= 80;
  const isAtLimit = usageStats.videosUsedToday >= usageStats.dailyLimit;

  if (isAtLimit) {
    return (
      <Alert className="border-accent/30 bg-card shadow-sm">
        <AlertTriangle className="h-4 w-4 text-accent" />
        <AlertDescription className="space-y-3">
          <div className="text-primary">
            You've reached your daily limit of {usageStats.dailyLimit} video{usageStats.dailyLimit > 1 ? 's' : ''}.
            Upgrade for unlimited access or try again tomorrow.
          </div>
          <div className="flex gap-2">
            <Link href="/profile/billing">
              <Button
                size="sm"
                className="bg-[#6155F5] hover:bg-[#6155F5]/90 text-white border-[#463CBC] shadow-[inset_0px_0.5px_1px_0px_rgba(136,248,255,0.3),0px_4px_12px_1px_rgba(0,0,0,0.2)]"
              >
                <Crown className="w-4 h-4 mr-1" />
                Upgrade Plan
              </Button>
            </Link>
            <div className="flex items-center text-sm text-muted-foreground">
              <Clock className="w-4 h-4 mr-1" />
              Resets tomorrow
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (isNearLimit) {
    const remainingVideos = usageStats.dailyLimit - usageStats.videosUsedToday;

    return (
      <Alert className="border-accent/20 bg-card shadow-sm">
        <AlertTriangle className="h-4 w-4 text-accent" />
        <AlertDescription className="space-y-3">
          <div className="text-primary">
            You have {remainingVideos} video{remainingVideos > 1 ? 's' : ''} remaining for today.
            Upgrade for unlimited access.
          </div>
          <div className="flex gap-2">
            <Link href="/profile/billing">
              <Button
                size="sm"
                variant="outline"
                className="border-[#00D4DD] text-[#00D4DD] hover:bg-[#00D4DD]/10 dark:hover:bg-[#00D4DD]/20 transition-all duration-200"
              >
                <Crown className="w-4 h-4 mr-1" />
                View Plans
              </Button>
            </Link>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Show regular usage info for free users
  const remainingVideos = usageStats.dailyLimit - usageStats.videosUsedToday;

  return (
    <Alert className="border-accent/10 bg-card/50 shadow-sm">
      <AlertDescription className="flex items-center justify-between">
        <div className="text-primary">
          {remainingVideos} of {usageStats.dailyLimit} daily video{usageStats.dailyLimit > 1 ? 's' : ''} remaining
        </div>
        <Link href="/profile/billing">
          <Button
            size="sm"
            variant="ghost"
            className="text-[#00D4DD] hover:text-[#00D4DD] hover:bg-[#00D4DD]/10 dark:hover:bg-[#00D4DD]/20 transition-all duration-200"
          >
            <Crown className="w-4 h-4 mr-1" />
            Upgrade
          </Button>
        </Link>
      </AlertDescription>
    </Alert>
  );
}
