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
    // (this.attributes = attributes),
    //   reduce((acc, info) => {
    //     const { name, data, stride } = info;
    //     acc[name] = {
    //       data,
    //       stride,
    //       buffer: new VertexBuffer({ gl, data }),
    //     };
    //     return acc;
    //   }, {});
    // this.attriutes = {
    //   position: {
    //     // location: gl.getAttribLocation(program, 'aPosition'),
    //     data: vertices,
    //     stride: 3,
    //     buffer: new VertexBuffer({
    //       gl,
    //       data: vertices,
    //     }),
    //   },
    //   color: {
    //     // location: gl.getAttribLocation(program, 'aColor'),
    //     data: colors,
    //     stride: 3,
    //     buffer: new VertexBuffer({
    //       gl,
    //       data: colors,
    //     }),
    //   },
    // };
    this.indices = indices;
    this.indexBuffer = new IndexBuffer({ gl, data: this.indices });

    // this.indices = [0, 2, 1, 1, 2, 3];
    // // this.vertexCount = this.indices.length / 3;
    // this.indexBuffer = new IndexBuffer({ gl, data: this.indices });
  }
  // getVertexBuffer() {
  // }
}
