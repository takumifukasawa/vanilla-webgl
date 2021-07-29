import Matrix4 from './Matrix4.js';
import Vector3 from './Vector3.js';
import Actor from './Actor.js';
import { ActorType, CameraType } from './Constants.js';

export default class CameraActor extends Actor {
  #renderTarget;
  #postProcess;

  get renderTarget() {
    return this.#renderTarget;
  }

  get postProcess() {
    return this.#postProcess;
  }

  constructor(args = {}) {
    super({ ...args, type: ActorType.CameraActor });
    const { gpu, camera, lookAt, postProcess, renderTarget } = args;
    this.camera = camera;
    this.lookAt = lookAt || null;
    this.#postProcess = postProcess || null;
    this.#renderTarget = renderTarget;
  }

  setSize({ width, height }) {
    super.setSize({ width, height });

    if (this.camera.type === CameraType.OrthographicCamera) {
      const aspect = this.camera.aspect || width / height;
      this.camera.updateProjectionMatrix({
        left: this.camera.left * aspect,
        right: this.camera.right * aspect,
        bottom: this.camera.bottom,
        top: this.camera.top,
      });
    } else {
      const aspect = width / height;
      this.camera.updateProjectionMatrix({ aspect });
    }

    if (this.#renderTarget) {
      this.#renderTarget.setSize(width, height);
    }

    if (this.#postProcess) {
      this.#postProcess.setSize(width, height);
    }
  }

  update({ time, deltaTime }) {
    super.update({ time, deltaTime });
    if (this.lookAt) {
      const lookAtCameraMatrix = Matrix4.createLookAtCameraMatrix(
        this.position,
        new Vector3(0, 0, 0),
        new Vector3(0, 1, 0),
      );
      this.camera.cameraMatrix = lookAtCameraMatrix;
    }
  }
}
