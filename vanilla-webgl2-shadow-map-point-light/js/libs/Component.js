export default class Component {
  constructor({ type }) {
    this.type = type;
    this.isStarted = false;
  }
  setSize({ actor, width, height }) {}
  start({ actor, time, deltaTime }) {}
  update({ actor, time, deltaTime }) {}
  render({ actor, time, deltaTime }) {}
  clone() {
    throw 'should implemented clone method.';
  }
}
