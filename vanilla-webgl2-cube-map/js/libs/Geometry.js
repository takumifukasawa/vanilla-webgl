import IndexBuffer from './IndexBuffer.js';
import { Vector3 } from './Vector3.js';
import VertexBuffer from './VertexBuffer.js';

function getTangent(n) {
  if (n.equals(new Vector3(0, -1, 0))) {
    return Vector3.crossVectors(n, new Vector3(0, 0, -1));
  }
  if (n.equals(new Vector3(0, 1, 0))) {
    return Vector3.crossVectors(n, new Vector3(0, 0, -1));
  }
  return Vector3.crossVectors(n, new Vector3(0, -1, 0));
}

export default class Geometry {
  constructor({
    gpu,
    attributes,
    indices,
    autoGenerateTangents = true,
    autoGenerateBinormals = true,
  }) {
    const gl = gpu.getGl();

    if (attributes.aNormal && autoGenerateTangents) {
      const tangents = [];
      for (let i = 0; i < attributes.aNormal.data.length; i += 3) {
        const n = new Vector3(
          attributes.aNormal.data[i],
          attributes.aNormal.data[i + 1],
          attributes.aNormal.data[i + 2]
        );
        const t = getTangent(n);
        tangents.push(...t.getArray());
      }
      attributes.aTangent = {
        data: tangents,
        stride: 3,
      };
    }

    if (attributes.aNormal && autoGenerateBinormals) {
      const binormals = [];
      for (let i = 0; i < attributes.aNormal.data.length; i += 3) {
        const n = new Vector3(
          attributes.aNormal.data[i],
          attributes.aNormal.data[i + 1],
          attributes.aNormal.data[i + 2]
        );
        const t = getTangent(n);
        const b = Vector3.crossVectors(n, t);
        binormals.push(...b.getArray());
      }
      attributes.aBinormal = {
        data: binormals,
        stride: 3,
      };
    }

    this.attributes = Object.keys(attributes).reduce((acc, name) => {
      const { data, stride } = attributes[name];
      acc[name] = {
        data,
        stride,
        buffer: new VertexBuffer({
          gl,
          data,
        }),
      };
      return acc;
    }, {});

    if (indices) {
      this.indices = {
        data: indices,
        buffer: new IndexBuffer({ gl, data: indices }),
      };
    }
  }
}
