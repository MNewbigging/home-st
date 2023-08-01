import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { FixedCameraController } from "./cameras/fixed-camera-controller";
import { GameLoader } from "./loaders/game-loader";
import { KeyboardListener } from "./listeners/keyboard-listener";
import { MouseListener } from "./listeners/mouse-listener";
import { addGui } from "./utils/utils";

export class GameState {
  private mouseListener: MouseListener;
  private keyboardListener: KeyboardListener;
  private fixedCameraController: FixedCameraController;

  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private clock = new THREE.Clock();

  private house?: THREE.Object3D;

  constructor(
    private canvas: HTMLCanvasElement,
    private gameLoader: GameLoader
  ) {
    // Listeners
    this.mouseListener = new MouseListener(canvas);
    this.keyboardListener = new KeyboardListener();

    // Setup camera
    this.camera = new THREE.PerspectiveCamera(
      75,
      canvas.clientWidth / canvas.clientHeight,
      0.1,
      100
    );
    
    this.fixedCameraController = new FixedCameraController(this.mouseListener, this.keyboardListener, this.camera);

    // Setup renderer
    this.renderer = new THREE.WebGLRenderer({ canvas });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    THREE.ColorManagement.legacyMode = false;
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.toneMapping = THREE.LinearToneMapping;
    this.renderer.toneMappingExposure = 1;
    this.renderer.shadowMap.enabled = true;
    window.addEventListener("resize", this.onCanvasResize);
    this.onCanvasResize();

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
    const floorMat = new THREE.MeshBasicMaterial({ color: 'grey' });
    const floorMesh = new THREE.Mesh(floorPlane, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -0.001;
    this.scene.add(floorMesh);

    addGui(floorMesh);

    // Setup player
    this.setInitialPosition();

    // Start game
    this.update();
  }

  private setInitialPosition() {
    if (!this.house) {
      return;
    }

    // Find the first selection ring
    const ring = this.house.getObjectByName("ring-outside-front");
    if (!ring) {
      return;
    }

    // Move slightly above it
    this.camera.position.set(
      ring.position.x,
      ring.position.y + 1.7,
      ring.position.z
    );
  }

  private onCanvasResize = () => {
    this.renderer.setSize(
      this.canvas.clientWidth,
      this.canvas.clientHeight,
      false
    );

    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight;

    this.camera.updateProjectionMatrix();
  };

  private update = () => {
    requestAnimationFrame(this.update);

    const dt = this.clock.getDelta();

    this.fixedCameraController.update(dt);
    this.renderer.render(this.scene, this.camera);
  };
}
