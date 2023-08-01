import * as THREE from "three";

import { MouseListener } from "../listeners/mouse-listener";

export class FixedCameraController {
  private readonly dampingFactor = 0.07; 
  private spherical = new THREE.Spherical(1, Math.PI  / 2);
  private sphericalDelta = new THREE.Spherical();
  private target = new THREE.Vector3();
  private epsilon = 1e-3;
  private mouseSensitivity = 0.5;

  constructor(
    private mouseListener: MouseListener,
    private camera: THREE.Camera
  ) {
    // Enabled by default
    this.enable();
  }

  enable() {
    this.mouseListener.on("leftclickdrag", this.onLeftClickDrag);
  }

  update() {
    // Head to target values
    this.spherical.theta += this.sphericalDelta.theta * this.dampingFactor;
    this.spherical.phi += this.sphericalDelta.phi * this.dampingFactor;

    // Cap vertical rotation
    this.spherical.phi = Math.max(0, Math.min(Math.PI, this.spherical.phi));
    this.spherical.makeSafe();

    // Update camera
    const newTarget = new THREE.Vector3().setFromSpherical(this.spherical).add(this.camera.position);

    if (this.target.sub(newTarget).length() > this.epsilon) {
      this.camera.lookAt(newTarget);
    }

    // Lower delta values by damping factor
    this.sphericalDelta.theta *= 1 - this.dampingFactor;
    this.sphericalDelta.phi *= 1 - this.dampingFactor;
  }

  private onLeftClickDrag = () => {
    const { movePosition, canvasElement } = this.mouseListener;

    this.sphericalDelta.theta +=
      (2 * Math.PI * this.mouseSensitivity * movePosition.delta.x) / canvasElement.clientWidth;

    this.sphericalDelta.phi -=
      (Math.PI * this.mouseSensitivity * movePosition.delta.y) / canvasElement.clientHeight;
  };
}
