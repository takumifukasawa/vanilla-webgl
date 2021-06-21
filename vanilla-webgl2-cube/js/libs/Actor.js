import { Matrix4 } from './Matrix.js';

export default class Actor {
  static Types = {
    MeshActor: 'MeshActor',
  };
  constructor({ type }) {
    this.type = type;
    this.components = [];
    this.worldTransform = Matrix4.identity();
  }
  addComponent(component) {
    this.components.push(component);
  }
  // wip
  // removeComponent(name) {
  //   const index = this.components.findIndex(
  //     (component) => component.name === name
  //   );
  //   if (index > -1) {
  //     this.components(index, 1);
  //   }
  // }
  update({ time, deltaTime }) {
    for (let i = 0; i < this.components.length; i++) {
      const component = this.components[i];
      component.update({ actor: this, time, deltaTime });
    }
  }
}
