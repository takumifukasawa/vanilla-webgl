import Engine from './Engine.js';
import Matrix4 from './Matrix4.js';
import Vector3 from './Vector3.js';

export default class Actor {
  constructor(args = {}) {
    const {
      name,
      type,
      components = [],
      onBeginStart = () => {},
      onEndStart = () => {},
      onBeginUpdate = () => {},
      onEndUpdate = () => {},
      onBeginSetSize = () => {},
      onEndSetSize = () => {},
    } = args;
    this.name = name || '';
    this.type = type || Engine.ActorType.None;
    this.components = components || [];
    this.worldTransform = Matrix4.identity();
    this.position = Vector3.zero();
    this.onBeginStart = onBeginStart;
    this.onBeginUpdate = onBeginUpdate;
    this.onBeginSetSize = onBeginSetSize;
    this.onEndStart = onEndStart;
    this.onEndUpdate = onEndUpdate;
    this.onEndSetSize = onEndSetSize;
  }
  findComponent(type) {
    const component = this.components.find((component) => {
      return component.type === type;
    });
    return component || null;
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
    this.onBeginStart();
    for (let i = 0; i < this.components.length; i++) {
      const component = this.components[i];
      if (!component.isStarted) {
        component.start({ actor: this, time, deltaTime });
        component.isStarted = true;
      }
    }
    this.onEndStart();
  }
  update({ time, deltaTime }) {
    this.onBeginUpdate();
    for (let i = 0; i < this.components.length; i++) {
      const component = this.components[i];
      component.update({ actor: this, time, deltaTime });
    }
    this.onEndUpdate();
  }
  setSize({ width, height }) {
    this.onBeginSetSize();
    for (let i = 0; i < this.components.length; i++) {
      const component = this.components[i];
      component.setSize({ actor: this, width, height });
    }
    this.onEndSetSize();
  }
}
