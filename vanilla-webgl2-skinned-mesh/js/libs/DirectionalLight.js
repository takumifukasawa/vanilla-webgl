import { LightType } from './Constants.js';
import Light from './Light.js';

export default class DirectionalLight extends Light {
  constructor({ color, intensity }) {
    super({
      color,
      intensity,
      type: LightType.DirectionalLight,
    });
  }
}
