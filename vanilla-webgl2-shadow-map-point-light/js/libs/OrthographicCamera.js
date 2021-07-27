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
  orthographicSize;

  constructor(
    left = -1,
    right = 1,
    bottom = -1,
    top = 1,
    nearClip = 0.1,
    farClip = 50,
    fixedAspect = null,
  ) {
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
    if (this.orthographicSize) {
      this.projectionMatrix = Matrix4.getOrthographicMatrix(
        -this.orthographicSize,
        this.orthographicSize,
        -this.orthographicSize,
        this.orthographicSize,
        this.nearClip,
        this.farClip,
      );
      return;
    }
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
