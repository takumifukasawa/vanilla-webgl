import IndexBuffer from './IndexBuffer.js';
import VertexBuffer from './VertexBuffer.js';

export default class Geometry {
  constructor({ gpu, attributes, indices, primitiveType }) {
    const gl = gpu.getGl();
    // this.vertexBuffers = Object.keys(attributes).reduce((acc, name) => {
    //   const { data } = attributes[name];
    //   acc[name] = new VertexBuffer({
    //     gl,
    //     data,
    //   });
    // }, {});
    this.attributes = Object.keys(attributes).reduce((acc, name) => {
      const { data, stride } = attributes[name];
      acc[name] = {
        name,
        data,
        stride,
        buffer: new VertexBuffer({
          gl,
          data,
        }),
      };
      return acc;
    }, {});
    this.indices = {
      buffer: new IndexBuffer({ gl, data: this.indices }),
      data: indices,
    };
    // this.indices = indices;
    this.primitiveType = primitiveType;
  }
}
