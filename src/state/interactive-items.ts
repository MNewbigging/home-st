import { Intersecter } from "../utils/intersecter";
import { MouseListener } from "../listeners/mouse-listener";
import { Renderer } from "./renderer";

export class InteractiveItems {
  private readonly interactiveItems = ["Front_door"];

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

    // Was the object intersected interactive?
    const name = intersection.object.parent?.name;
    if (!name) {
      return;
    }

    if (this.interactiveItems.includes(name)) {
      // Highlight all children of the intersected object's parent
      intersection.object.parent?.children.forEach((child) =>
        this.renderer.outlineObject(child)
      );
    }
  };
}
