import Camera from './Camera.js';
import Engine from './Engine.js';
import Matrix4 from './Matrix4.js';

export default class PerspectiveCamera extends Camera {
  // #fixedAspect;

  constructor(
    fov = 45,
    aspect = 1,
    nearClip = 0.1,
    farClip = 50,
    // fixedAspect = null,
  ) {
    super({ type: Engine.CameraType.PerspectiveCamera });
    this.fov = fov;
    this.nearClip = nearClip;
    this.farClip = farClip;
    this.cameraMatrix = Matrix4.identity();
    this.projectionMatrix = Matrix4.identity();
    // this.#fixedAspect = fixedAspect;
    this.updateProjectionMatrix(aspect);
  }

  // aspect: w / h
  updateProjectionMatrix(aspect) {
    this.projectionMatrix = Matrix4.getPerspectiveMatrix(
      this.fov,
      aspect,
      // this.#fixedAspect || aspect,
      this.nearClip,
      this.farClip,
    );
  }
}
