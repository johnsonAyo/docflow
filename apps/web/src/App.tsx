import { useRoute } from "./hooks/useRoute";
import { LandingPage } from "./pages/LandingPage";
import { WorkspacePage } from "./pages/WorkspacePage";

export function App() {
  const route = useRoute();

  if (route === "app") {
    return <WorkspacePage />;
  }

  return <LandingPage />;
}
