import { getCurrentUser } from "@/lib/auth";
import { UserPlanService } from "@/lib/user-plan-service";
import { DashboardTitle } from "../dashboard-sidebar";
import { UpgradePrompt } from "../upgrade-prompt";
import { Playground } from "./playground";

export default async function PlaygroundPage() {
  const user = await getCurrentUser();
  const plan = await UserPlanService.getCurrentPlan(user.id);

  return (
    <>
      <DashboardTitle meta="Coba ambil transkrip YouTube langsung dari dashboard, tanpa API key.">
        Playground
      </DashboardTitle>
      {plan === "free" ? <UpgradePrompt feature="Playground" /> : <Playground />}
    </>
  );
}
