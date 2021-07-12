import Camera from './Camera.js';
import Matrix4 from './Matrix4.js';

export default class PerspectiveCamera extends Camera {
  constructor(fov, aspect, nearClip, farClip) {
    super();
    this.fov = fov;
    this.nearClip = nearClip;
    this.farClip = farClip;
    this.cameraMatrix = Matrix4.identity();
    this.projectionMatrix = Matrix4.identity();
    this.updateProjectionMatrix(aspect);
  }

  // aspect: w / h
  updateProjectionMatrix(aspect) {
    this.projectionMatrix = Matrix4.getPerspectiveMatrix(
      this.fov,
      aspect,
      this.nearClip,
      this.farClip,
    );
  }
}
