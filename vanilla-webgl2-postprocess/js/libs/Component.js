export default class Component {
  static Types = {
    MeshComponent: 'MeshComponent',
    LifeCycleComponent: 'LifeCycleComponent',
    CameraComponent: 'CameraComponent',
  };
  constructor({ type }) {
    this.type = type;
    this.isStarted = false;
  }
  setSize({ actor, width, height }) {}
  start({ actor, time, deltaTime }) {}
  update({ actor, time, deltaTime }) {}
  render({ actor, time, deltaTime }) {}
}
