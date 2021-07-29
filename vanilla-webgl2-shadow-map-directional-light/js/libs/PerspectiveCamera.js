import Camera from './Camera.js';
import Matrix4 from './Matrix4.js';
import { CameraType } from './Constants.js';
export default class PerspectiveCamera extends Camera {
  #fov;
  #nearClip;
  #farClip;
  #aspect;

  cameraMatrix;
  projectionMatrix;

  get fov() {
    return this.#fov;
  }

  get nearClip() {
    return this.#nearClip;
  }

  get farClip() {
    return this.#farClip;
  }

  get aAspect() {
    return this.#aspect;
  }

  constructor(fov = 45, aspect = 1, nearClip = 0.1, farClip = 50) {
    super({ type: CameraType.PerspectiveCamera });
    this.#fov = fov;
    this.#aspect = aspect;
    this.#nearClip = nearClip;
    this.#farClip = farClip;
    this.cameraMatrix = Matrix4.identity();
    this.projectionMatrix = Matrix4.identity();
    this.updateProjectionMatrix();
  }

  setParams({ fov, nearClip, farClip, aspect }) {
    this.#fov = fov;
    this.#nearClip = nearClip;
    this.#farClip = farClip;
    this.#aspect = aspect;
  }

  // aspect: w / h
  updateProjectionMatrix(aspect = null) {
    if (aspect) {
      this.#aspect = aspect;
    }
    this.projectionMatrix = Matrix4.getPerspectiveMatrix(
      this.fov,
      this.#aspect,
      // this.#fixedAspect || aspect,
      this.nearClip,
      this.farClip,
    );
  }
}
