'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gift, Clock, CheckCircle } from 'lucide-react';
import { getCurrentUserWithSponsorAccess, UserWithSponsorAccess } from '@/lib/auth-with-sponsor';

export function SponsorDealStatus() {
  const [userWithAccess, setUserWithAccess] = useState<UserWithSponsorAccess | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getCurrentUserWithSponsorAccess();
        setUserWithAccess(data);
      } catch (error) {
        console.error('Error fetching user sponsor data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Sponsor Access
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>Loading...</div>
        </CardContent>
      </Card>
    );
  }

  const { sponsorAccess } = userWithAccess || { sponsorAccess: { hasAccess: false } };

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5" />
          Sponsor Access
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {sponsorAccess.hasAccess && sponsorAccess.deal ? (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Status</span>
              <Badge variant="default" className="flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Active
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Deal</span>
              <span className="text-sm text-muted-foreground">
                {sponsorAccess.deal.dealName}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Expires</span>
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {sponsorAccess.deal.expiresAt.toLocaleDateString()}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Days Remaining</span>
              <span className="text-sm text-muted-foreground">
                {sponsorAccess.deal.daysRemaining} days
              </span>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <div className="text-sm text-muted-foreground mb-2">
              No active sponsor deals
            </div>
            <Badge variant="secondary">No Access</Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}