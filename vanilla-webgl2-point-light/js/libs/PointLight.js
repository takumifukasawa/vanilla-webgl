import Vector3 from './Vector3.js';

export default class PointLight {
  color;
  position;
  intensity;
  attenuation;

  constructor({ color, position, intensity, attenuation }) {
    this.color = color || Vector3.one();
    this.position = position || Vector3.one();
    this.intensity = intensity || 1;
    this.attenuation = attenuation || 1;
  }
}
