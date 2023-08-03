import * as THREE from "three";

import { EventListener } from "../listeners/event-listener";
import { MouseListener } from "../listeners/mouse-listener";
import { Point } from "./common-types";

export class Intersecter {
  private readonly raycaster = new THREE.Raycaster();

  constructor(
    private scene: THREE.Scene,
    private camera: THREE.Camera,
    private mouseListener: MouseListener,
    private events: EventListener
  ) {
    this.mouseListener.on("move", this.onMouseMove);
  }

  getIntersection(
    screenPosNormalised: Point
  ): THREE.Intersection<THREE.Object3D<THREE.Event>> | undefined {
    this.raycaster.setFromCamera(screenPosNormalised, this.camera);

    const intersections = this.raycaster.intersectObjects(
      this.scene.children,
      true
    );
    if (!intersections.length) {
      return undefined;
    }

    return intersections[0];
  }

  private readonly onMouseMove = () => {
    // Get any intersection
    const intersection = this.getIntersection(
      this.mouseListener.movePosition.normalised
    );
    if (!intersection) {
      return;
    }

    // Fire intersection event
    this.events.fire("object-intersected", intersection);
  };
}
