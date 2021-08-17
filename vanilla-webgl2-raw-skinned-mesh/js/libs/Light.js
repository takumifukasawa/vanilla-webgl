import Vector3 from './Vector3.js';

export default class Light {
  type;
  color;
  intensity;

  constructor({ type, color, intensity }) {
    this.type = type;
    this.color = color || Vector3.one();
    this.intensity = intensity || 1;
  }
}
