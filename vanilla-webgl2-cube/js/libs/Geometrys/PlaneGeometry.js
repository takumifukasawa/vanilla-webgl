import IndexBuffer from '../IndexBuffer.js';
import VertexBuffer from '../VertexBuffer.js';

export default class PlaneGeometry {
  constructor({ gpu, program, vertices, colors }) {
    const gl = gpu.getGl();
    this.attributes = {
      position: {
        // location: gl.getAttribLocation(program, 'aPosition'),
        data: vertices,
        stride: 3,
        buffer: new VertexBuffer({
          gl,
          data: vertices,
        }),
      },
      color: {
        // location: gl.getAttribLocation(program, 'aColor'),
        data: colors,
        stride: 3,
        buffer: new VertexBuffer({
          gl,
          data: colors,
        }),
      },
    };
    this.indices = [0, 2, 1, 1, 2, 3];
    // this.vertexCount = this.indices.length / 3;
    this.indexBuffer = new IndexBuffer({ gl, data: this.indices });
  }
  // getVertexBuffer() {
  // }
}
