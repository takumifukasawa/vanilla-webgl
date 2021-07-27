import Engine from './Engine.js';
import Vector3 from './Vector3.js';

export default class Attribute {
  constructor({ type, data, stride, location }) {
    this.type = type;
    this.data = data;
    this.stride = stride;
    this.location = location;
  }
  static createTangent(normalData) {
    const tangents = [];
    for (let i = 0; i < normalData.length; i += 3) {
      const n = new Vector3(
        normalData[i],
        normalData[i + 1],
        normalData[i + 2],
      );
      const t = Vector3.getTangent(n);
      tangents.push(...t.getArray());
    }
    return {
      type: Engine.AttributeType.Tangent,
      data: tangents,
      stride: 3,
    };
  }
  static createBinormal(normalData) {
    const binormals = [];
    for (let i = 0; i < normalData.length; i += 3) {
      const n = new Vector3(
        normalData[i],
        normalData[i + 1],
        normalData[i + 2],
      );
      const t = Vector3.getTangent(n);
      const b = Vector3.crossVectors(n, t);
      binormals.push(...b.getArray());
    }
    return {
      type: Engine.AttributeType.Binormal,
      data: binormals,
      stride: 3,
    };
  }
}
