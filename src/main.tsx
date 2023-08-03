import "./index.scss";

import React from "react";
import ReactDOM from "react-dom/client";

import { App } from "./components/App";
import { AppState } from "./state/app-state";

const appState = new AppState();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App appState={appState} />
  </React.StrictMode>
);
