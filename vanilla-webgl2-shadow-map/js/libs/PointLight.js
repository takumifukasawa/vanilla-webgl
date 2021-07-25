import Vector3 from './Vector3.js';
import Light from './Light.js';

export default class PointLight {
  attenuation;

  constructor({ color, intensity, attenuation }) {
    super({ color, intensity, type: Engine.LightType.PointLight });
    this.attenuation = attenuation || 1;
  }
}
