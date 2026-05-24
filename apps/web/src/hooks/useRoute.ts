import { useState, useEffect } from "react";

function getRoute() {
  if (window.location.hash === "#/app" || window.location.pathname === "/app") {
    return "app";
  }
  return "landing";
}

export function useRoute() {
  const [route, setRoute] = useState(() => getRoute());

  useEffect(() => {
    const handleRouteChange = () => setRoute(getRoute());
    window.addEventListener("hashchange", handleRouteChange);
    window.addEventListener("popstate", handleRouteChange);
    return () => {
      window.removeEventListener("hashchange", handleRouteChange);
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, []);

  return route;
}
