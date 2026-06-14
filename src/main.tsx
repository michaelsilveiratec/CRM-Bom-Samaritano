import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { clearBrowserRuntimeCaches, refreshStaleClientCache, unregisterServiceWorkers } from "./utils/cacheHygiene";
import "./styles/index.css";

refreshStaleClientCache();
clearBrowserRuntimeCaches().catch((error) => {
  console.warn("Nao foi possivel limpar caches do navegador:", error);
});

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.warn("Nao foi possivel registrar o aplicativo mobile:", error);
    });
  });
} else {
  unregisterServiceWorkers().catch((error) => {
    console.warn("Nao foi possivel remover service workers no modo dev:", error);
  });
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
