import IndexBuffer from './IndexBuffer.js';
import VertexBuffer from './VertexBuffer.js';

export default class Geometry {
  constructor({ gpu, attributes, indices }) {
    const gl = gpu.getGl();
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
