import * as THREE from "three";
import { gsap } from "gsap";

import { Intersecter } from "../utils/intersecter";
import { MouseListener } from "../listeners/mouse-listener";
import { Renderer } from "./renderer";

export class InteractiveItems {
  private readonly interactiveItems = [
    "Front_door",
    "Living_room_door",
    "Study_door",
    "Study_cupboard_door",
    "Livingroom_cupboard_door_left",
    "Livingroom_cupboard_door_right",
    "Back_hall_door",
    "Understairs_door_left",
    "Understairs_door_right",
    "Kitchen_door",
    "Bathroom_door",
    "Back_door",
    "Bedroom1_door",
    "Bedroom2_door",
    "Landing_cupboard_door",
  ];

  private readonly doorOpenRadians = 1.48353;

  constructor(
    private mouseListener: MouseListener,
    private intersecter: Intersecter,
    private renderer: Renderer
  ) {
    this.mouseListener.on("move", this.onMouseMove);
    this.mouseListener.on("leftclick", this.onLeftClick);
  }

  /**
   * Intersections can occur on a named object, like Front_door, itself or
   * on child meshes. E.g Front_door has a few child meshes which always capture
   * the intersections rather than the parent.
   *
   * For highlighting on mouse move, the object(s) to highlight depend on:
   * - when the named object is intersected directly, just highlight that one object
   * - when the
   */

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

    // Is it the intersected object itself interactive?
    if (this.interactiveItems.includes(intersection.object.name)) {
      // Just highlight that
      this.renderer.outlineObject(intersection.object);
      return;
    }

    // Otherwise, is the parent object interactive?
    const parentName = intersection.object.parent?.name;
    if (parentName && this.interactiveItems.includes(parentName)) {
      // Highlight all children of the intersected object's parent
      intersection.object.parent?.children.forEach((child) =>
        this.renderer.outlineObject(child)
      );
      return;
    }
  };

  private readonly onLeftClick = () => {
    // Did user click on an interactive item?
    const intersection = this.intersecter.getIntersection(
      this.mouseListener.clickPosition.normalised
    );
    if (!intersection || !intersection.object.parent) {
      return;
    }

    let name, object;

    // Is the intersected object interactive?
    if (this.interactiveItems.includes(intersection.object.name)) {
      name = intersection.object.name;
      object = intersection.object;
    } else {
      // Otherwise, was it the parent?
      const parentName = intersection.object.parent?.name;
      if (parentName && this.interactiveItems.includes(parentName)) {
        name = parentName;
        object = intersection.object.parent;
      }
    }

    // Ensure we have both the name and object to continue
    if (!name || !object) {
      return;
    }

    // Interact with the item
    switch (name) {
      case "Living_room_door":
      case "Livingroom_cupboard_door_right":
      case "Back_hall_door":
      case "Understairs_door_right":
      case "Kitchen_door":
      case "Bathroom_door":
      case "Back_door":
      case "Bedroom1_door":
      case "Landing_cupboard_door":
        this.interactDoor(object);
        break;
      case "Front_door":
      case "Study_door":
      case "Study_cupboard_door":
      case "Livingroom_cupboard_door_left":
      case "Understairs_door_left":
      case "Bedroom2_door":
        this.interactDoor(object, true);
        break;
    }
  };

  private getInteractiveObject(intersectedObject: THREE.Object3D) {
    // Is it the intersected object itself?
    if (this.interactiveItems.includes(intersectedObject.name)) {
      return intersectedObject;
    }

    // It could be the parent
    const parentName = intersectedObject.parent?.name;
    if (parentName && this.interactiveItems.includes(parentName)) {
      return intersectedObject.parent;
    }

    // Otherwise it's not interactive
    return undefined;
  }

  private getInteractiveItemName(object: THREE.Object3D) {
    // Test against this object first
    if (this.interactiveItems.includes(object.name)) {
      return object.name;
    }

    // Then against the parent
    const name = object.parent?.name;
    if (!name) {
      return undefined;
    }

    return this.interactiveItems.includes(name) ? name : undefined;
  }

  // Inverse = should it open via negative rotation or positive (default)
  private interactDoor(parent: THREE.Object3D, inverse = false) {
    const doorRadians = inverse ? -this.doorOpenRadians : this.doorOpenRadians;

    // State stored under object data
    if (parent.userData.open) {
      // Close it
      gsap.to(parent.rotation, { duration: 1, y: 0 });
      parent.userData.open = false;
    } else {
      // Open it
      gsap.to(parent.rotation, { duration: 1, y: doorRadians });
      parent.userData.open = true;
    }
  }
}
