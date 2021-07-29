import Matrix4 from './Matrix4.js';
import Vector3 from './Vector3.js';
import { ActorType } from './Constants.js';
import Transform from './Transform.js';

export default class Actor {
  // #position;
  // #rotation;
  // #scale;

  #type;
  #name;
  #components;

  // #worldTransform;
  #transform = new Transform();

  get type() {
    return this.#type;
  }

  get name() {
    return this.#name;
  }

  get components() {
    return this.#components;
  }

  get position() {
    return this.#transform.position;
  }

  get rotation() {
    return this.#transform.rotation;
  }

  get scale() {
    return this.#transform.scale;
  }

  get transform() {
    return this.#transform;
  }

  constructor(args = {}) {
    const { name, type, components = [] } = args;
    this.#name = name || '';
    this.#type = type || ActorType.None;
    this.#components = components || [];
    // this.worldTransform = Matrix4.identity();
    // this.position = Vector3.zero();
  }

  setPosition(position) {
    this.#transform.setPosition(position);
  }

  setRotation(rotation) {
    this.#transform.rotation(rotation);
  }

  setRotationX(rad) {
    this.#transform.setRotationX(rad);
  }

  setRotationY(rad) {
    this.#transform.setRotationY(rad);
  }

  setRotationZ(rad) {
    this.#transform.setRotationZ(rad);
  }

  setScale(scale) {
    this.#transform.setScale(scale);
  }

  isType(type) {
    return this.type === type;
  }

  findComponent(type) {
    const component = this.#components.find((component) => {
      return component.type === type;
    });
    return component || null;
  }

  addComponent(component) {
    this.#components.push(component);
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
    for (let i = 0; i < this.#components.length; i++) {
      const component = this.#components[i];
      if (!component.isStarted) {
        component.start({ actor: this, time, deltaTime });
        component.setIsStarted(true);
      }
    }
  }

  update({ time, deltaTime }) {
    for (let i = 0; i < this.#components.length; i++) {
      const component = this.#components[i];
      component.update({ actor: this, time, deltaTime });
    }
  }

  setSize({ width, height }) {
    for (let i = 0; i < this.#components.length; i++) {
      const component = this.#components[i];
      component.setSize({ actor: this, width, height });
    }
  }
}
