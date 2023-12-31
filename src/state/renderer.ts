import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader";
import { OutlinePass } from "three/examples/jsm/postprocessing/OutlinePass";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";

import { EventListener } from "../listeners/event-listener";

export class Renderer {
  private effectComposer: EffectComposer;
  private renderer: THREE.WebGLRenderer;
  private renderPass: RenderPass;
  public outlinePass: OutlinePass;

  constructor(
    private canvas: HTMLCanvasElement,
    private scene: THREE.Scene,
    private camera: THREE.PerspectiveCamera
  ) {
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

    // Setup pipeline
    this.effectComposer = new EffectComposer(this.renderer);
    this.effectComposer.renderToScreen = true;

    // Initial render acts as input for next pass
    this.renderPass = new RenderPass(scene, camera);
    this.effectComposer.addPass(this.renderPass);

    // Outline pass
    this.outlinePass = new OutlinePass(
      new THREE.Vector2(canvas.clientWidth, canvas.clientHeight),
      scene,
      camera
    );
    this.outlinePass.edgeStrength = 10;
    this.outlinePass.edgeThickness = 0.25;
    this.outlinePass.edgeGlow = 0;
    this.outlinePass.visibleEdgeColor.set("#ffffff");
    this.effectComposer.addPass(this.outlinePass);

    // This corrects the output from the outline pass for srgbe encoding
    this.effectComposer.addPass(new ShaderPass(GammaCorrectionShader));
  }

  render(dt: number) {
    this.effectComposer.render(dt);
  }

  outlineObject(object: THREE.Object3D) {
    this.outlinePass.selectedObjects.push(object);
  }

  clearOutlines() {
    this.outlinePass.selectedObjects = [];
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
}
