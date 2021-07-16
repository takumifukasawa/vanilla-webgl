export default class Component {
  static Types = {
    MeshComponent: 'MeshComponent',
    LifeCycleComponent: 'LifeCycleComponent',
    PerspectiveCameraComponent: 'PerspectiveCameraComponent',
    OrthographicCameraComponent: 'OrthographicCameraComponent',
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
