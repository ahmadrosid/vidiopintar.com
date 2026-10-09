import { DashboardTitle } from "../dashboard-sidebar";
import { Playground } from "./playground";

export default function PlaygroundPage() {
  return (
    <>
      <DashboardTitle meta="Coba ambil transkrip YouTube langsung dari dashboard, tanpa API key.">
        Playground
      </DashboardTitle>
      <Playground />
    </>
  );
}
