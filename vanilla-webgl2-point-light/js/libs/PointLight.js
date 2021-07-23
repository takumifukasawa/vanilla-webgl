import Vector3 from './Vector3.js';

export default class PointLight {
  color;
  position;
  intensity;

  constructor({ color, position, intensity }) {
    this.color = color || Vector3.one();
    this.position = position || Vector3.one();
    this.intensity = intensity || 1;
  }
}
