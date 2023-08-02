import * as THREE from "three";

import { Intersecter } from "../utils/intersecter";
import { KeyboardListener } from "../listeners/keyboard-listener";
import { MouseListener } from "../listeners/mouse-listener";

export class FixedCameraController {
  private readonly lookDampingFactor = 0.07;
  private spherical = new THREE.Spherical(1, Math.PI / 2);
  private sphericalDelta = new THREE.Spherical();
  private target = new THREE.Vector3();
  private readonly epsilon = 1e-3;
  private readonly mouseSensitivity = 0.5;
  private wheelDelta = 0;
  private readonly wheelMoveSpeedSlow = 2;
  private readonly wheelMoveSpeedFast = 5;
  private readonly wheelDampingFactor = 0.09;

  constructor(
    private mouseListener: MouseListener,
    private keyboardListener: KeyboardListener,
    private intersecter: Intersecter,
    private camera: THREE.PerspectiveCamera
  ) {
    // Enabled by default
    this.enable();
  }

  enable() {
    this.mouseListener.on("leftclickdrag", this.onLeftClickDrag);
    this.mouseListener.canvasElement.addEventListener("wheel", this.onWheel);
    this.mouseListener.on("rightclick", this.onRightClick);
  }

  update(dt: number) {
    // Work out the look direction
    this.spherical.theta += this.sphericalDelta.theta * this.lookDampingFactor;
    this.spherical.phi += this.sphericalDelta.phi * this.lookDampingFactor;

    // Cap vertical rotation
    this.spherical.phi = Math.max(0, Math.min(Math.PI, this.spherical.phi));
    this.spherical.makeSafe();

    // Update camera
    const newTarget = new THREE.Vector3()
      .setFromSpherical(this.spherical)
      .add(this.camera.position);

    if (this.target.sub(newTarget).length() > this.epsilon) {
      this.camera.lookAt(newTarget);
    }

    // Lower delta values by damping factor
    this.sphericalDelta.theta *= 1 - this.lookDampingFactor;
    this.sphericalDelta.phi *= 1 - this.lookDampingFactor;

    // Mouse wheel movement
    const facingDirection = new THREE.Vector3();
    this.camera.getWorldDirection(facingDirection);

    const speed = this.keyboardListener.isKeyPressed("shift")
      ? this.wheelMoveSpeedFast
      : this.wheelMoveSpeedSlow;

    const moveStep = facingDirection.multiplyScalar(
      this.wheelDelta * speed * dt
    );
    this.camera.position.add(moveStep);

    this.wheelDelta *= 1 - this.wheelDampingFactor;
    if (Math.abs(this.wheelDelta) < this.epsilon) {
      this.wheelDelta = 0;
    }
  }

  private onLeftClickDrag = () => {
    const { movePosition, canvasElement } = this.mouseListener;

    this.sphericalDelta.theta +=
      (2 * Math.PI * this.mouseSensitivity * movePosition.delta.x) /
      canvasElement.clientWidth;

    this.sphericalDelta.phi -=
      (Math.PI * this.mouseSensitivity * movePosition.delta.y) /
      canvasElement.clientHeight;
  };

  private onWheel = (event: WheelEvent) => {
    this.wheelDelta = -Math.sign(event.deltaY);
  };

  private onRightClick = () => {
    // Get intersected object
    const intersection = this.intersecter.getIntersection(
      this.mouseListener.clickPosition.normalised
    );
    if (!intersection) {
      return;
    }

    // Make sure we don't move closer than the camera near plane
    const distance = this.camera.position.distanceTo(intersection.point);
    if (distance < this.camera.near * 3) {
      return;
    }

    // Move camera near the intersection
    this.camera.position.lerp(intersection.point, 0.8);
  };
}
