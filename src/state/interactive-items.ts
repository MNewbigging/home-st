import { Intersecter } from "../utils/intersecter";
import { MouseListener } from "../listeners/mouse-listener";
import { Renderer } from "./renderer";

export class InteractiveItems {
  constructor(
    private mouseListener: MouseListener,
    private intersecter: Intersecter,
    private renderer: Renderer
  ) {
    this.mouseListener.on("move", this.onMouseMove);
  }

  private readonly onMouseMove = () => {
    // Clear all highlighted objects
    this.renderer.clearOutlines();

    // Get any intersection
    const intersection = this.intersecter.getIntersection(
      this.mouseListener.movePosition.normalised
    );
    if (!intersection) {
      return;
    }

    // Highlight intersected object
    this.renderer.outlineObject(intersection.object);
  };
}
