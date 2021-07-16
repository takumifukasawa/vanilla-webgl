import Camera from './Camera.js';
import Component from './Component.js';
import Vector3 from './Vector3.js';
import Matrix4 from './Matrix4.js';

export default class AbstractCameraComponent extends Component {
  lookAt;
  camera;

  constructor({ camera, type }) {
    super({ type });

    this.lookAt = Vector3.zero();

    this.camera = camera;
  }

  setSize() {
    throw 'should override setSize method';
  }

  update({ actor }) {
    const lookAtCameraMatrix = Matrix4.createLookAtCameraMatrix(
      actor.position,
      new Vector3(0, 0, 0),
      new Vector3(0, 1, 0),
    );
    this.camera.cameraMatrix = lookAtCameraMatrix;
  }
}
