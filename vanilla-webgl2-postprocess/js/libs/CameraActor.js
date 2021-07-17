import Matrix4 from './Matrix4.js';
import Vector3 from './Vector3.js';
import Actor from './Actor.js';
import Camera from './Camera.js';

export default class CameraActor extends Actor {
  constructor(args = {}) {
    super({ ...args, type: Actor.Types.CameraActor });
    this.camera = args.camera;
    this.lookAt = args.lookAt || null;
    this.renderTarget = args.renderTarget || null;
  }

  setSize({ width, height }) {
    super.setSize({ width, height });

    const aspect = width / height;
    if (this.camera.type === Camera.Types.OrthographicCamera) {
      this.camera.updateProjectionMatrix(
        this.camera.left * aspect,
        this.camera.right * aspect,
        this.camera.bottom,
        this.camera.top,
      );
    } else {
      this.camera.updateProjectionMatrix(width / height);
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

  setRenderTarget(renderTarget) {
    this.renderTarget = renderTarget;
  }

  clearRenderTarget() {
    this.renderTarget = null;
  }
}
