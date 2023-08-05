import "./hud.scss";

import React from "react";
import { observer } from "mobx-react-lite";

import { AppState } from "../../state/app-state";

interface HudProps {
  appState: AppState;
}

export const Hud: React.FC<HudProps> = observer(({ appState }) => {
  const openSymbol = appState.controlsOpen ? "↓" : "↑";

  return (
    <div className="hud">
      {appState.controlsOpen && (
        <div className="content">
          <p>Left click - Interact</p>
          <p>Left click & drag - Look around</p>
          <p>Right click - Move to location</p>
          <p>Wheel - Move forward / back</p>
          <p>Hold Shift - Wheel moves faster</p>
        </div>
      )}
      <div className="toggle" onClick={appState.toggleControls}>
        Controls <span>{openSymbol}</span>
      </div>
    </div>
  );
});
