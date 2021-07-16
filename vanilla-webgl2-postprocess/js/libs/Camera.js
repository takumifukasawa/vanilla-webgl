import Matrix4 from './Matrix4.js';
import Vector3 from './Vector3.js';

export default class Camera {
  constructor() {
    this.transform = Matrix4.identity();
    this.position = Vector3.zero();
    this.cameraMatrix = Matrix4.identity();
    this.lookAt = null;
  }
  update() {
    if (this.lookAt) {
      const lookAtCameraMatrix = Matrix4.createLookAtCameraMatrix(
        this.position,
        new Vector3(0, 0, 0),
        new Vector3(0, 1, 0),
      );
      this.cameraMatrix = lookAtCameraMatrix;
    }
  }
}
