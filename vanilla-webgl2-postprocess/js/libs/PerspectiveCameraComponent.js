import Camera from './Camera.js';
import Component from './Component.js';
import Vector3 from './Vector3.js';
import Matrix4 from './Matrix4.js';
import PerspectiveCamera from './PerspectiveCamera.js';

export default class PerspectiveCameraComponent extends Component {
  lookAt;
  camera;

  constructor(fov, aspect, nearClip, farClip) {
    super({
      type: Component.Types.PerspectiveCameraComponent,
    });

    this.camera = new PerspectiveCamera(fov, aspect, nearClip, farClip);

    this.camera.updateProjectionMatrix(aspect);

    this.lookAt = Vector3.zero();
  }

  setSize({ width, height }) {
    this.camera.updateProjectionMatrix(width / height);
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
