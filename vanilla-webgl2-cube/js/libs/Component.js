export default class Component {
  static Types = {
    MeshComponent: 'MeshComponent',
    LifeCycleComponent: 'LifeCycleComponent',
  };
  constructor({ type }) {
    this.type = type;
  }
  update({ actor, time, deltaTime }) {}
  render({ actor, time, deltaTime }) {}
}
