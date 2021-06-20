export default class Component {
  static Types = {
    MeshComponent: 'MeshComponent',
    LifeCycleComponent: 'LifeCycleComponent',
  };
  constructor({ type }) {
    this.type = type;
    this.actor = null;
  }
  setActor(actor) {
    this.actor = actor;
  }
  update() {}
  render() {}
}
