import Matrix4 from './Matrix4.js';
import Vector3 from './Vector3.js';

export default class Camera {
  type;

  constructor({ type }) {
    this.type = type;
    this.cameraMatrix = Matrix4.identity();
    this.projectionMatrix = Matrix4.identity();
  }

  updateProjectionMatrix() {
    throw 'should inherit update projection matrix methods.';
  }
}
