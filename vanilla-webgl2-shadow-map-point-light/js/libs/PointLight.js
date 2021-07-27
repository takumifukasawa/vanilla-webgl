import Vector3 from './Vector3.js';
import Light from './Light.js';
import Engine from './Engine.js';

export default class PointLight extends Light {
  attenuation;

  constructor({ color, intensity, attenuation }) {
    super({ color, intensity, type: Engine.LightType.PointLight });
    this.attenuation = attenuation || 1;
  }
}
