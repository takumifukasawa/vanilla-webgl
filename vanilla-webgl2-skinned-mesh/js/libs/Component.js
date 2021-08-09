export default class Component {
  #type;
  #isStarted;

  get type() {
    return this.#type;
  }

  get isStarted() {
    return this.#isStarted;
  }

  constructor({ type }) {
    this.#type = type;
    this.#isStarted = false;
  }

  setIsStarted(isStarted) {
    this.#isStarted = isStarted;
  }

  setSize({ actor, width, height }) {}
  start({ actor, time, deltaTime }) {}
  update({ actor, time, deltaTime }) {}
  render({ actor, time, deltaTime }) {}
  clone() {
    throw 'should implemented clone method.';
  }
}
