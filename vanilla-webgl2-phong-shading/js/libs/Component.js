export default class Component {
  static Types = {
    MeshComponent: 'MeshComponent',
    LifeCycleComponent: 'LifeCycleComponent',
  };
  constructor({ type }) {
    this.type = type;
    this.isStarted = false;
  }
  // NOTE: 最低限の引数
  start({ actor, time, deltaTime }) {}
  update({ actor, time, deltaTime }) {}
  render({ actor, time, deltaTime }) {}
}
