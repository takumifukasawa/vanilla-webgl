import Camera from './Camera.js';
import { Matrix4 } from './Matrix4.js';

export default class OrthographicCamera extends Camera {
  left;
  right;
  bottom;
  top;
  nearClip;
  farClip;

  constructor(left, right, bottom, top, nearClip, farClip) {
    super();
    this.left = left;
    this.right = right;
    this.bottom = bottom;
    this.top = top;
    this.nearClip = nearClip;
    this.farClip = farClip;
    this.cameraMatrix = Matrix4.identity();
    this.projectionMatrix = Matrix4.identity();
    this.updateProjectionMatrix();
  }
  // aspect: w / h
  updateProjectionMatrix() {
    this.projectionMatrix = Matrix4.getOrthographicMatrix(
      this.left,
      this.right,
      this.bottom,
      this.top,
      this.nearClip,
      this.farClip,
    );
  }
}
