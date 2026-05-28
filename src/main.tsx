import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { clearBrowserRuntimeCaches, refreshStaleClientCache } from "./utils/cacheHygiene";
import "./styles/index.css";

refreshStaleClientCache();
clearBrowserRuntimeCaches().catch((error) => {
  console.warn("Nao foi possivel limpar caches do navegador:", error);
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
