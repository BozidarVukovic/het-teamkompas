import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Analytics } from "@vercel/analytics/react";
import App from "./App";
import "./styles/global.css";
import OrganizedNavigation from "./components/shared/OrganizedNavigation";
import ScrollManager from "./components/shared/ScrollManager";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <ScrollManager />
      <OrganizedNavigation />
      <App />
      <Analytics />
    </BrowserRouter>
  </React.StrictMode>
);