import * as THREE from 'three';

import { Point } from "./common-types";

export class Intersecter {
  private readonly raycaster = new THREE.Raycaster();
  
  constructor(private scene: THREE.Scene, private camera: THREE.Camera) {}

  getIntersection(screenPosNormalised: Point): THREE.Intersection<THREE.Object3D<THREE.Event>> | undefined {
    this.raycaster.setFromCamera(screenPosNormalised, this.camera);

    const intersections = this.raycaster.intersectObjects(this.scene.children, true);
    if (!intersections.length) {
      return undefined;
    }

    return intersections[0];
  }
}