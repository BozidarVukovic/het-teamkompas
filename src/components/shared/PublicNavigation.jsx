// De publieke navigatie hoort niet in de besloten samenwerkomgeving.
// Deze wrapper laat de navigatie op de hele site staan, behalve onder /app.

import { useLocation } from "react-router-dom";
import OrganizedNavigation from "./OrganizedNavigation";

export default function PublicNavigation() {
  const { pathname } = useLocation();
  if (pathname === "/app" || pathname.startsWith("/app/")) return null;
  return <OrganizedNavigation />;
}
