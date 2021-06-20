import { Matrix4 } from './Matrix.js';

export default class Mesh {
  constructor({ geometry, material }) {
    this.geometry = geometry;
    this.material = material;
    this.worldTransform = Matrix4.identity();
    // TODO:
    // this.position;
    // this.rotation;
  }
}
