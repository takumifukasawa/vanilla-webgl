import Actor from './Actor.js';
import ShadowMap from './ShadowMap.js';
import Engine from './Engine.js';
import OrthographicCamera from './OrthographicCamera.js';
import Matrix4 from './Matrix4.js';
import Vector3 from './Vector3.js';

const orthographicSize = 1;
export default class LightActor extends Actor {
  light;

  #castShadow;
  #shadowMap;
  #shadowCamera;

  get castShadow() {
    return this.#castShadow;
  }

  get shadowMap() {
    return this.#shadowMap;
  }

  get shadowCamera() {
    return this.#shadowCamera;
  }

  constructor(args = {}) {
    super({ ...args, type: Engine.ActorType.LightActor });

    const { gpu, light, castShadow } = args;

    this.light = light;

    this.#castShadow = castShadow;

    // TODO: ortho, perspective の出し分け
    if (this.#castShadow) {
      this.#shadowMap = new ShadowMap({ gpu });
      this.#shadowCamera =
        light.type === Engine.LightType.DirectionalLight
          ? new OrthographicCamera(
              -orthographicSize,
              orthographicSize,
              -orthographicSize,
              orthographicSize,
              0.1,
              30,
              1,
            )
          : new OrthographicCamera(
              -orthographicSize,
              orthographicSize,
              -orthographicSize,
              orthographicSize,
              0.1,
              30,
              1,
            );
    }
  }

  setSize({ width, height }) {
    super.setSize({ width, height });
    if (this.#shadowCamera) {
      this.#shadowCamera.updateProjectionMatrix(
        -orthographicSize,
        orthographicSize,
        -orthographicSize,
        orthographicSize,
      );
    }
    // if(this.#shadowMap) {
    //   this.#shadowMap
    // }
  }

  update() {
    if (this.#shadowCamera) {
      const lookAtCameraMatrix = Matrix4.createLookAtCameraMatrix(
        this.position,
        new Vector3(0, 0, 0), // look at
        new Vector3(0, 1, 0),
      );
      this.#shadowCamera.cameraMatrix = lookAtCameraMatrix;
    }
  }
}
