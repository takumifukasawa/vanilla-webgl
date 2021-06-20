import IndexBuffer from './IndexBuffer.js';
import VertexBuffer from './VertexBuffer.js';

export default class Geometry {
  constructor({ gpu, attributes, indices, primitiveType }) {
    const gl = gpu.getGl();
    this.attributes = Object.keys(attributes).map((name) => {
      const { data, stride } = attributes[name];
      return {
        name,
        data,
        stride,
        buffer: new VertexBuffer({
          gl,
          data,
        }),
      };
    }, []);
    this.indices = indices;
    this.indexBuffer = new IndexBuffer({ gl, data: this.indices });
    this.primitiveType = primitiveType;
  }
}
