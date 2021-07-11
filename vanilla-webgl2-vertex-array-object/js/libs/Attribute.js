import { Vector3 } from './Vector3.js';

function getTangent(n) {
  if (n.equals(new Vector3(0, -1, 0))) {
    return Vector3.crossVectors(n, new Vector3(0, 0, 1));
  }
  if (n.equals(new Vector3(0, 1, 0))) {
    return Vector3.crossVectors(n, new Vector3(0, 0, 1));
  }
  return Vector3.crossVectors(n, new Vector3(0, -1, 0));
}

export default class Attribute {
  static Types = {
    Position: 'Position',
    Normal: 'Normal',
    Uv: 'UV',
    Tangent: 'Tangent',
    Binormal: 'Binormal',
  };
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
      const t = getTangent(n);
      tangents.push(...t.getArray());
    }
    return {
      type: Attribute.Types.Tangent,
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
      const t = getTangent(n);
      const b = Vector3.crossVectors(n, t);
      binormals.push(...b.getArray());
    }
    return {
      type: Attribute.Types.Binormal,
      data: binormals,
      stride: 3,
    };
  }
}
