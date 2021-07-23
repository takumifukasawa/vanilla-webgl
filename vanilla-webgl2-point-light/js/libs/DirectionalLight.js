import Vector3 from './Vector3.js';

export default class DirectionalLight {
  constructor({ color, position }) {
    this.color = color || Vector3.one();
    this.position = position || Vector3.one();
  }
}
