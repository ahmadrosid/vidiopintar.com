"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DeleteProfile } from "./delete-profile";
import { UserPreferences } from "./user-preferences";
import { ProfileFeedback } from "./profile-feedback";

interface ProfileSettingsProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  userLanguage: 'en' | 'id';
}

export function ProfileSettings({ user, userLanguage }: ProfileSettingsProps) {
  const profileName = user.name;
  const username = user.email.split("@")[0];

  const getInitials = () => {
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <Card className="shadow-none pt-4 md:pt-6">
        <CardContent className="px-4 md:px-6">
          <h1 className="text-lg font-semibold mb-6 md:mb-8">Profile</h1>

          <div className="flex flex-col sm:flex-row gap-4">
            {/* Profile picture section */}
            <div className="flex justify-center sm:justify-start">
              <Avatar className="h-20 w-20 sm:h-16 sm:w-16 border shadow-xs">
                <AvatarImage src={user.image!} alt={user.name} />
                <AvatarFallback className="bg-pink-200 text-xl">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="space-y-1 text-center sm:text-left">
              <p className="text-base md:text-lg font-medium">{profileName}</p>
              <p className="text-sm md:text-base text-muted-foreground break-all">{user.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <UserPreferences defaultLanguage={userLanguage} />

      <ProfileFeedback />

      <DeleteProfile />
    </div>
  );
}