import Component from './Component.js';
import AbstractCameraComponent from './AbstractCameraComponent.js';
import OrthographicCamera from './OrthographicCamera.js';

export default class OrthographicCameraComponent extends AbstractCameraComponent {
  left;
  right;
  bottom;
  top;

  constructor(left, right, bottom, top, nearClip, farClip) {
    super({
      camera: new OrthographicCamera(
        left,
        right,
        bottom,
        top,
        nearClip,
        farClip,
      ),
      type: Component.Types.CameraComponent,
    });

    this.left = left;
    this.right = right;
    this.bottom = bottom;
    this.top = top;
    this.nearClip = nearClip;
    this.farClip = farClip;
  }

  setSize({ width, height }) {
    const aspect = width / height;

    this.camera.left = this.left * aspect;
    this.camera.right = this.right * aspect;
    this.camera.bottom = this.bottom;
    this.camera.top = this.top;

    this.camera.updateProjectionMatrix();
  }
}
