"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteProfile } from "./delete-profile";
import { UserPreferences } from "./user-preferences";
import { ProfileFeedback } from "./profile-feedback";
import { useTranslations } from "next-intl";
import type { UserPlan } from "@/lib/user-plan-service";
import { Pencil } from "lucide-react";
import { useClerk } from "@clerk/nextjs";

interface ProfileSettingsProps {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
  currentPlan: UserPlan;
}

export function ProfileSettings({ user, currentPlan }: ProfileSettingsProps) {
  const t = useTranslations("profile");
  const tPricing = useTranslations("pricing");
  const { openUserProfile } = useClerk();

  const getInitials = () => {
    return user.name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const planName = tPricing(`plans.${currentPlan}.name`);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tighter mb-2">
          {t("title")}
        </h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      <div className="relative overflow-hidden rounded-xl border border-violet-500/20 bg-gradient-to-br from-violet-600/90 via-purple-700/80 to-violet-900/90 p-5 md:p-6">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 80%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 40%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='100' height='20' viewBox='0 0 100 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 10 Q25 0 50 10 T100 10' fill='none' stroke='white' stroke-width='0.5'/%3E%3C/svg%3E\")",
            backgroundSize: "200px 40px",
          }}
        />

        <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
          <Avatar className="h-16 w-16 shrink-0 border-2 border-white/20 shadow-lg">
            <AvatarImage src={user.image ?? undefined} alt={user.name} />
            <AvatarFallback className="bg-violet-400/50 text-white text-lg">
              {getInitials()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <p className="text-xl md:text-2xl font-bold text-white truncate">
              {user.name}
            </p>
            <p className="text-sm text-white/70 break-all">{user.email}</p>
          </div>

          <div className="flex sm:flex-col items-start sm:items-end gap-2 shrink-0">
            <Link href="/profile/billing">
              <Badge className="bg-violet-500/30 text-white border-violet-400/40 hover:bg-violet-500/40 cursor-pointer">
                {planName}
              </Badge>
            </Link>
            <Button
              variant="outline"
              size="sm"
              className="bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white"
              onClick={() => openUserProfile()}
            >
              <Pencil className="h-3.5 w-3.5 mr-1.5" />
              {t("editProfile")}
            </Button>
          </div>
        </div>
      </div>

      <UserPreferences />

      <ProfileFeedback />

      <DeleteProfile />
    </div>
  );
}
