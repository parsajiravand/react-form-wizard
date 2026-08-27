/**
 * Local development entry — mounts the demo app in `index.html`.
 * Not part of the published package; the library entry is `src/main.ts`.
 */
import ReactDOM from "react-dom/client";
import App from "./App.js";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <App />
);
