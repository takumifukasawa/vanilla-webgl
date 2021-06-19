export default class VertexBuffer {
  constructor({ gl, data }) {
    this.gl = gl;
    // create buffer
    this.vbo = gl.createBuffer();
    // bind buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    // set data to buffer
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
    // clear buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, null);
  }
  update() {
    const gl = this.gl;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
  }
  getBuffer() {
    return this.vbo;
  }
}
