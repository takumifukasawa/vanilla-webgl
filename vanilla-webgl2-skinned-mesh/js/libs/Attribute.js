import Vector3 from './Vector3.js';
import { AttributeType } from './Constants.js';

export default class Attribute {
  constructor({ type, data, stride, location }) {
    if (!type) {
      throw 'invalid type';
    }
    if (!data) {
      throw 'invalid data';
    }
    if (!stride) {
      throw 'invalid stride';
    }
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
      type: AttributeType.Tangent,
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
      type: AttributeType.Binormal,
      data: binormals,
      stride: 3,
    };
  }
}
