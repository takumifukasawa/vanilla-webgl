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
  // TODO: pass data to gpu
  render({ gpu, shader }) {
    const gl = gpu.getGl();
    const program = shader.getProgram();
    for (let i = 0; i < this.attributes.length; i++) {
      const { name, buffer, stride } = this.attributes[i];
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer.getBuffer());
      const location = gl.getAttribLocation(program, name);
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, stride, gl.FLOAT, false, 0, 0);
    }
    // indices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer.getBuffer());
  }
}
