import Matrix4 from './Matrix4.js';
import Vector3 from './Vector3.js';

export default class Camera {
  constructor() {
    this.transform = Matrix4.identity();
    this.position = Vector3.zero();
  }
}
