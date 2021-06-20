import Component from './Component.js';
import { Matrix4 } from './Matrix.js';

export default class Actor {
  constructor() {
    this.components = [];
    this.worldTransform = Matrix4.identity();
  }
  addComponent(component) {
    component.setActor(this);
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
  update() {
    for (let i = 0; i < this.components.length; i++) {
      const component = this.components[i];
      component.update();
    }
  }
  // TODO: camera 渡さない
  render({ gpu, camera }) {
    const meshComponents = this.components.filter(({ type }) => {
      return type === Component.Types.MeshComponent;
    });
    for (let i = 0; i < meshComponents.length; i++) {
      meshComponents[i].render({
        gpu,
        modelMatrix: this.worldTransform,
        viewMatrix: camera.worldTransform.getInvertMatrix(),
        projectionMatrix: camera.projectionMatrix,
      });
    }
  }
}
