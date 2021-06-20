export default class Component {
  static Types = {
    MeshComponent: 'MeshComponent',
  };
  constructor({ type }) {
    this.type = type;
  }
  update() {}
}
