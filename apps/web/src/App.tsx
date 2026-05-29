import { useRoute } from "@/hooks/useRoute";
import { LandingPage } from "@/pages/LandingPage";
import { WorkspacePage } from "@/pages/WorkspacePage";
import { SharedReportPage } from "@/pages/SharedReportPage";

export function App() {
  const route = useRoute();

  if (route === "report") {
    return <SharedReportPage />;
  }

  if (route === "app") {
    return <WorkspacePage />;
  }

  return <LandingPage />;
}
