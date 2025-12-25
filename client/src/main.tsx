import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

document.documentElement.classList.add("dark");

const root = createRoot(document.getElementById("root")!);
root.render(<App />);

// Remove loading screen when app mounts
const hideLoading = () => {
  const loadingScreen = document.getElementById("loading-screen");
  if (loadingScreen) {
    loadingScreen.classList.add("hidden");
    setTimeout(() => {
      loadingScreen.remove();
    }, 300);
  }
};

if (document.readyState === "complete") {
  hideLoading();
} else {
  window.addEventListener("load", hideLoading);
}
