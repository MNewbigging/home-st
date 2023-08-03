import * as THREE from "three";

import { EventListener } from "../listeners/event-listener";
import { FixedCameraController } from "../cameras/fixed-camera-controller";
import { GameLoader } from "../loaders/game-loader";
import { InteractiveItems } from "./interactive-items";
import { Intersecter } from "../utils/intersecter";
import { KeyboardListener } from "../listeners/keyboard-listener";
import { MouseListener } from "../listeners/mouse-listener";
import { Renderer } from "./renderer";
import { addGui } from "../utils/utils";

export class GameState {
  private mouseListener: MouseListener;
  private keyboardListener: KeyboardListener;
  private events: EventListener;
  private intersecter: Intersecter;
  private renderer: Renderer;
  private fixedCameraController: FixedCameraController;
  private interactiveItems: InteractiveItems;

  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private clock = new THREE.Clock();

  private house?: THREE.Object3D;
  private readonly interactiveObjects = ["Front_door"];

  constructor(
    private canvas: HTMLCanvasElement,
    private gameLoader: GameLoader
  ) {
    // Listeners
    this.mouseListener = new MouseListener(canvas);
    this.keyboardListener = new KeyboardListener();
    this.events = new EventListener();

    // Setup camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      100
    );
    this.camera.position.set(0, 1.7, -4.5);

    this.renderer = new Renderer(canvas, this.scene, this.camera);

    this.intersecter = new Intersecter(
      this.scene,
      this.camera,
      this.mouseListener,
      this.events
    );

    this.fixedCameraController = new FixedCameraController(
      this.mouseListener,
      this.keyboardListener,
      this.intersecter,
      this.camera
    );

    this.interactiveItems = new InteractiveItems(
      this.mouseListener,
      this.intersecter,
      this.renderer
    );

    this.scene.background = new THREE.Color("#1680AF");

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);

    const directLight = new THREE.DirectionalLight();
    this.scene.add(directLight);

    // Add house model
    const house = this.gameLoader.modelLoader.get("house");
    if (house) {
      this.house = house;
      this.scene.add(house);
    }

    // Add basic floor plane
    const floorPlane = new THREE.PlaneGeometry(10, 10);
    const floorMat = new THREE.MeshBasicMaterial({ color: "grey" });
    const floorMesh = new THREE.Mesh(floorPlane, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -0.001;
    this.scene.add(floorMesh);

    this.events.on("object-intersected", this.onIntersection);

    // Start game
    this.update();
  }

  private onIntersection = (
    intersection: THREE.Intersection<THREE.Object3D<THREE.Event>>
  ) => {
    // Was the object intersected interactive?
    const name = intersection.object.parent?.name;
    if (!name) {
      return;
    }

    if (this.interactiveObjects.includes(name)) {
      this.renderer.outlineObject(intersection.object);
    }
  };

  private update = () => {
    requestAnimationFrame(this.update);

    const dt = this.clock.getDelta();

    this.fixedCameraController.update(dt);

    this.renderer.render(dt);

    // Post render

    // Clear outline pass
    //this.renderer.clearOutlines();
  };
}
