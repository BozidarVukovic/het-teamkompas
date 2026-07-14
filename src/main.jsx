import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import App from "./App";
import OrganizedNavigation from "./components/shared/OrganizedNavigation";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <OrganizedNavigation />
      <App />
      <Analytics />
    </BrowserRouter>
  </React.StrictMode>
);