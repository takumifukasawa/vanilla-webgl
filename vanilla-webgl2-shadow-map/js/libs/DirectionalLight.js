import Engine from './Engine.js';
import Vector3 from './Vector3.js';
import Light from './Light.js';

export default class DirectionalLight extends Light {
  constructor({ color, position, intensity }) {
    super({
      color,
      position,
      intensity,
      type: Engine.LightType.DirectionalLight,
    });
  }
}
