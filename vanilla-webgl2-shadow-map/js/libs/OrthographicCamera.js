import Camera from './Camera.js';
import Engine from './Engine.js';
import Matrix4 from './Matrix4.js';

export default class OrthographicCamera extends Camera {
  left;
  right;
  bottom;
  top;
  nearClip;
  farClip;
  fixedAspect;

  constructor(left, right, bottom, top, nearClip, farClip, fixedAspect) {
    super({ type: Engine.CameraType.OrthographicCamera });
    this.left = left;
    this.right = right;
    this.bottom = bottom;
    this.top = top;
    this.nearClip = nearClip;
    this.farClip = farClip;
    this.fixedAspect = fixedAspect;
    this.cameraMatrix = Matrix4.identity();
    this.projectionMatrix = Matrix4.identity();
    this.updateProjectionMatrix(this.left, this.right, this.bottom, this.top);
  }

  // aspect: w / h
  updateProjectionMatrix(left, right, bottom, top) {
    this.projectionMatrix = Matrix4.getOrthographicMatrix(
      left,
      right,
      bottom,
      top,
      this.nearClip,
      this.farClip,
    );
  }
}
