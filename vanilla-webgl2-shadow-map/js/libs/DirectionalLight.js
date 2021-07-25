import Engine from './Engine.js';
import Vector3 from './Vector3.js';
import Light from './Light.js';

export default class DirectionalLight extends Light {
  constructor({ color, intensity }) {
    super({
      color,
      intensity,
      type: Engine.LightType.DirectionalLight,
    });
  }
}
