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

    this.attributes = [...this.attributes].map((attribute, i) => {
      const location =
        attribute.location === undefined ? i : attribute.location;

      if (normal) {
        switch (attribute.type) {
          case Attribute.Types.Tangent:
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
            return {
              ...attribute,
              data: tangents,
              location,
              stride: 3,
            };

          case Attribute.Types.Binormal:
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
            return {
              ...attribute,
              data: binormals,
              location,
              stride: 3,
            };
        }
      }

      return {
        ...attribute,
        location,
      };
    });

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
