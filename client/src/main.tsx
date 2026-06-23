import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import "./index.css";
import App from "./App.jsx";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root Element not found");
}
createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);

/*
 * TO DO: will need to update this
 * Loading overlays are used for the home page and kitchen routes (new and recipe)
 */
window.hideLoadingOverlay = function () {
  const loadingoverlay = document.getElementById("loadingoverlay");
  if (loadingoverlay) {
    loadingoverlay.classList.add("fade-out");
    setTimeout(() => loadingoverlay.remove(), 200);
  }
};
