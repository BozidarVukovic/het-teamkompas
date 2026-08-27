import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import App from "./App";
import "./styles/global.css";
import PublicNavigation from "./components/shared/PublicNavigation";
import ScrollManager from "./components/shared/ScrollManager";
import AnalyticsBridge from "./components/shared/AnalyticsBridge";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ScrollManager />
      <AnalyticsBridge />
      <PublicNavigation />
      <App />
      <Analytics />
    </BrowserRouter>
  </React.StrictMode>
);