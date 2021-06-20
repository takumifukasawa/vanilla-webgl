import { Matrix4 } from './Matrix.js';

export default class PerspectiveCamera {
  constructor(fov, aspect, nearClip, farClip) {
    this.fov = fov;
    this.nearClip = nearClip;
    this.farClip = farClip;
    this.updateProjectionMatrix(aspect);
  }
  updateProjectionMatrix(aspect) {
    this.projectionMatrix = Matrix4.getPerspectiveMatrix(
      this.fov,
      aspect,
      this.nearClip,
      this.farClip
    );
  }
}