import { action, makeAutoObservable, observable } from "mobx";

import { GameLoader } from "../loaders/game-loader";
import { GameState } from "./game-state";

export class AppState {
  readonly gameLoader = new GameLoader();
  gameState?: GameState;

  @observable controlsOpen = true;

  constructor() {
    makeAutoObservable(this);

    // Give canvas time to mount
    setTimeout(() => this.loadGame(), 10);
  }

  @action toggleControls = () => {
    this.controlsOpen = !this.controlsOpen;
  };

  private async loadGame() {
    this.gameLoader.load(this.startGame);
  }

  private startGame = () => {
    const canvas = document.getElementById("canvas") as HTMLCanvasElement;
    if (!canvas) {
      console.error("could not find game canvas");
      return;
    }

    canvas.oncontextmenu = (event) => {
      event.stopPropagation();
      event.preventDefault();
    };

    this.gameState = new GameState(canvas, this.gameLoader);
  };
}
