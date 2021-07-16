import Component from './Component.js';
import AbstractCameraComponent from './AbstractCameraComponent.js';
import PerspectiveCamera from './PerspectiveCamera.js';

export default class PerspectiveCameraComponent extends AbstractCameraComponent {
  constructor(fov, aspect, nearClip, farClip) {
    super({
      camera: new PerspectiveCamera(fov, aspect, nearClip, farClip),
      type: Component.Types.CameraComponent,
    });

    this.camera.updateProjectionMatrix(aspect);
  }

  setSize({ width, height }) {
    this.camera.updateProjectionMatrix(width / height);
  }
}
