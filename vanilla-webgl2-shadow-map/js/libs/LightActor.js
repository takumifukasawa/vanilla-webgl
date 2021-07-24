import Actor from './Actor.js';

export default class LightActor extends Actor {
  #castShadow;

  constructor(args = {}) {
    const { castShadow } = args;

    super(args);

    this.#castShadow = castShadow;
  }

  setSize() {}
}
