import IndexBuffer from './IndexBuffer.js';
import VertexBuffer from './VertexBuffer.js';

export default class Geometry {
  constructor({ gpu, attributes, indices, primitiveType }) {
    const gl = gpu.getGl();
    this.attributes = Object.keys(attributes).map((name) => {
      const { data, stride, attributeName } = attributes[name];
      return {
        attributeName,
        data,
        stride,
        buffer: new VertexBuffer({
          gl,
          data,
        }),
      };
    }, []);
    this.primitiveType = primitiveType;
    this.indices = indices;
    this.indexBuffer = new IndexBuffer({ gl, data: this.indices });
  }
}
