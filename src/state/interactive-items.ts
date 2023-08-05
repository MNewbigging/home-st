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
    "Study_window_base",
    "Study_window_top",
    "Livingroom_window_base_left",
    "Livingroom_window_base_mid",
    "Livingroom_window_base_right",
    "Livingroom_window_top_left",
    "Livingroom_window_top_mid",
    "Livingroom_window_top_right",
    "Bedroom1_window",
    "Bedroom2_window",
    "Kitchen_window_left",
    "Kitchen_window_right",
    "Bathroom_window",
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
      // Doors
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

      // Sash Windows
      case "Study_window_base":
      case "Livingroom_window_base_left":
      case "Livingroom_window_base_mid":
      case "Livingroom_window_base_right":
        this.interactSashWindow(object);
        break;
      case "Study_window_top":
      case "Livingroom_window_top_left":
      case "Livingroom_window_top_mid":
      case "Livingroom_window_top_right":
        this.interactSashWindow(object, true);
        break;

      // Normal windows
      case "Bedroom1_window":
      case "Bedroom2_window":
        this.interactWindow(object);
        break;
      case "Kitchen_window_left":
      case "Kitchen_window_right":
      case "Bathroom_window":
        this.interactWindow(object, true);
    }
  };

  // Inverse = should it open via negative rotation or positive (default)
  private interactDoor(object: THREE.Object3D, inverse = false) {
    const doorTravel = inverse ? -this.doorOpenRadians : this.doorOpenRadians;

    // State stored under object data
    if (object.userData.open) {
      // Close it
      gsap.to(object.rotation, { duration: 1, y: 0 });
      object.userData.open = false;
    } else {
      // Open it
      gsap.to(object.rotation, { duration: 1, y: doorTravel });
      object.userData.open = true;
    }
  }

  private interactSashWindow(object: THREE.Object3D, top = false) {
    const windowTravel = top ? -0.3 : 0.3;

    // State stored under object data
    if (object.userData.open) {
      // Close it
      gsap.to(object.position, {
        duration: 1,
        y: object.userData.startingPosition,
      });
      object.userData.open = false;
    } else {
      // Is it's starting position set already?
      if (!object.userData.startingPosition) {
        object.userData.startingPosition = object.position.y;
      }

      // Open it
      gsap.to(object.position, {
        duration: 1,
        y: object.userData.startingPosition + windowTravel,
      });
      object.userData.open = true;
    }
  }

  private interactWindow(object: THREE.Object3D, inverse = false) {
    // 30 degrees
    const windowTravel = inverse ? -0.349066 : 0.349066;

    if (object.userData.open) {
      // Close it
      gsap.to(object.rotation, { duration: 1, x: 0 });
      object.userData.open = false;
    } else {
      // Open it
      gsap.to(object.rotation, { duration: 1, x: windowTravel });
      object.userData.open = true;
    }
  }
}
