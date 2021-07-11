import { Matrix4 } from './Matrix4.js';

export default class Actor {
  static Types = {
    MeshActor: 'MeshActor',
  };
  constructor({ type, name }) {
    this.type = type;
    this.name = name || '';
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
  start({ time, deltaTime }) {
    for (let i = 0; i < this.components.length; i++) {
      const component = this.components[i];
      if (!component.isStarted) {
        component.start({ actor: this, time, deltaTime });
        component.isStarted = true;
      }
    }
  }
  update({ time, deltaTime }) {
    for (let i = 0; i < this.components.length; i++) {
      const component = this.components[i];
      component.update({ actor: this, time, deltaTime });
    }
  }
}
