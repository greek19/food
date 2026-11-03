import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { createFoodAuth } from "./auth.js";
import { loadRuntimeConfig } from "./config.js";
import "../styles.css";

loadRuntimeConfig()
  .then((config) => createRoot(document.getElementById("root")).render(<StrictMode><App auth={createFoodAuth(config)} /></StrictMode>))
  .catch(() => createRoot(document.getElementById("root")).render(<StrictMode><App auth={createFoodAuth()} /></StrictMode>));
