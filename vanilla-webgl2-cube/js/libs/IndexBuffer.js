export default class IndexBuffer {
  constructor({ gl, data }) {
    // this.gl = gl;
    this.indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Int16Array(data),
      gl.STATIC_DRAW
    );
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);
  }
  // update() {
  //   const gl = this.gl;
  //   gl.bindBuffer(gl.ARRAY_BUFFER, this.indexBuffer);
  // }
  getBuffer() {
    return this.indexBuffer;
  }
}
