import Actor from './Actor.js';
import ShadowMap from './ShadowMap.js';
import Engine from './Engine.js';

export default class LightActor extends Actor {
  light;

  #castShadow;
  #shadowMap;

  get castShadow() {
    return this.#castShadow;
  }

  get shadowMap() {
    return this.#shadowMap;
  }

  constructor(args = {}) {
    super({ ...args, type: Engine.ActorType.LightActor });

    const { gpu, light, castShadow } = args;

    this.light = light;

    this.#castShadow = castShadow;

    if (this.#castShadow) {
      this.#shadowMap = new ShadowMap({ gpu });
    }
  }

  setSize({ width, height }) {
    super.setSize({ width, height });
  }
}
