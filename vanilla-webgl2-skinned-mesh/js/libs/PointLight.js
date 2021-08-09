import Vector3 from './Vector3.js';
import Light from './Light.js';
import { LightType } from './Constants.js';

export default class PointLight extends Light {
  attenuation;

  constructor({ color, intensity, attenuation }) {
    super({ color, intensity, type: LightType.PointLight });
    this.attenuation = attenuation || 1;
  }
}
