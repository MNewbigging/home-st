import "./app.scss";

import React from "react";
import { observer } from "mobx-react-lite";

import { AppState } from "../state/app-state";
import { Hud } from "./hud/hud";
import { LoadingScreen } from "../loading-screen/loading-screen";

interface AppProps {
  appState: AppState;
}

export const App: React.FC<AppProps> = observer(({ appState }) => {
  return (
    <div className="app">
      <canvas id="canvas"></canvas>

      <Hud appState={appState} />

      {appState.gameLoader.loading && <LoadingScreen />}

      {!appState.gameLoader.loading && <Hud appState={appState} />}
    </div>
  );
});
