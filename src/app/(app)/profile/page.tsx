import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProfileSettings } from "./profile-settings";
import { UserPlanService } from "@/lib/user-plan-service";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/");
  }

  const currentPlan = await UserPlanService.getCurrentPlan(user.id);

  return <ProfileSettings user={user} currentPlan={currentPlan} />;
}
