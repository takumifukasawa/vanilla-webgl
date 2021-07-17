import Matrix4 from './Matrix4.js';
import Vector3 from './Vector3.js';

export default class Camera {
  type;

  static Types = {
    PerspectiveCamera: 'PerspectiveCamera',
    OrthographicCamera: 'OrthographicCamera',
  };

  constructor({ type }) {
    this.type = type;
    this.cameraMatrix = Matrix4.identity();
  }

  updateProjectionMatrix() {
    throw 'should inherit update projection matrix methods.';
  }
}
