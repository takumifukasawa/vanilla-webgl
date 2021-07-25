import Vector3 from './Vector3.js';

export default class Light {
  type;
  color;
  position;
  intensity;

  constructor({ type, color, position, intensity }) {
    this.type = type;
    this.color = color || Vector3.one();
    this.position = position || Vector3.one();
    this.intensity = intensity || 1;
  }
}
