import { Matrix4 } from './Matrix.js';

export default class Actor {
  constructor() {
    this.components = [];
    this.worldTransform = Matrix4.identity();
  }
  addComponent(component) {
    this.components.push(component);
  }
  // FYI
  removeComponent(name) {
    const index = this.components.findIndex(
      (component) => component.name === name
    );
    if (index > -1) {
      this.components(index, 1);
    }
  }
  update() {
    for (let i = 0; i < this.components.length; i++) {
      const component = this.components[i];
      component.update();
    }
  }
}
