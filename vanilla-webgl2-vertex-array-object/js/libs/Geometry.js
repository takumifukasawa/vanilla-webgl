import Attribute from './Attribute.js';
import IndexBuffer from './IndexBuffer.js';
import { Vector3 } from './Vector3.js';
import VertexArrayObject from './VertexArrayObject.js';
import VertexBuffer from './VertexBuffer.js';

function getTangent(n) {
  if (n.equals(new Vector3(0, -1, 0))) {
    return Vector3.crossVectors(n, new Vector3(0, 0, 1));
  }
  if (n.equals(new Vector3(0, 1, 0))) {
    return Vector3.crossVectors(n, new Vector3(0, 0, 1));
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

    const normal = attributes.find(
      ({ type }) => type === Attribute.Types.Normal,
    );

    this.attributes = attributes;
    this.indices = indices;

    if (normal && autoGenerateTangents) {
      const tangents = [];
      for (let i = 0; i < normal.data.length; i += 3) {
        const n = new Vector3(
          normal.data[i],
          normal.data[i + 1],
          normal.data[i + 2],
        );
        const t = getTangent(n);
        tangents.push(...t.getArray());
      }
      this.attributes.push({
        type: Attribute.Types.Tangent,
        data: tangents,
        stride: 3,
      });
    }

    if (normal && autoGenerateBinormals) {
      const binormals = [];
      for (let i = 0; i < normal.data.length; i += 3) {
        const n = new Vector3(
          normal.data[i],
          normal.data[i + 1],
          normal.data[i + 2],
        );
        const t = getTangent(n);
        const b = Vector3.crossVectors(n, t);
        binormals.push(...b.getArray());
      }
      this.attributes.push({
        type: Attribute.Types.Binormal,
        data: binormals,
        stride: 3,
      });
    }

    this.attributes = [...this.attributes].map((attribute, i) => {
      return {
        ...attribute,
        location: attribute.location === undefined ? i : attribute.location,
      };
    });
    console.log(this.attributes);

    this.vao = new VertexArrayObject({
      gl,
      attributes: this.attributes,
      indices,
    });

    this.indices = indices;

    // if (indices) {
    //   this.indices = {
    //     data: indices,
    //     buffer: new IndexBuffer({ gl, data: indices }),
    //   };
    // }
  }

  get vertexCount() {
    const position = this.attributes.find(
      ({ type }) => type === Attribute.Types.Position,
    );
    return position ? position.data.length / 3 : 0;
  }
}
