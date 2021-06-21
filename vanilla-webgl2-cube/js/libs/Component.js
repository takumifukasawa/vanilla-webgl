export default class Component {
  static Types = {
    MeshComponent: 'MeshComponent',
    LifeCycleComponent: 'LifeCycleComponent',
  };
  constructor({ type }) {
    this.type = type;
  }
  // NOTE: 最低限の引数
  update({ actor, time, deltaTime }) {}
  render({ actor, time, deltaTime }) {}
}
