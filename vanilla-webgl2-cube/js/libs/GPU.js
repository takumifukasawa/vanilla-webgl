export default class GPU {
  static Primitives = {
    Point: 0,
    Line: 1,
    Triangle: 2,
  };
  constructor({ canvasElement }) {
    this.gl = canvasElement.getContext('webgl2');
    // this.vertexBuffer = null;
    this.vertexFormat = null;
    this.geometry = null;
    this.material = null;
  }
  setSize(width, height) {
    this.gl.viewport(0, 0, width, height);
  }
  clear(r, g, b, a) {
    const gl = this.gl;
    gl.clearColor(r, g, b, a);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.flush();
    const e = gl.getError();
    if (e !== gl.NO_ERROR) {
      throw 'has gl error.';
    }
  }
  getGl() {
    return this.gl;
  }
  getProgram() {
    return this.material.getProgram();
  }
  // setVertexBuffer(vertexBuffer) {
  //   this.vertexBuffer = vertexBuffer;
  // }
  setGeometry(geometry) {
    this.geometry = geometry;
  }
  setMaterial(material) {
    this.material = material;
    const program = this.material.getProgram();
    this.gl.useProgram(program);
  }
  // setVertexFormat(vertexFormat) {
  //   this.vertexFormat = vertexFormat;
  // }
  draw() {
    const gl = this.gl;
    const program = this.material.getProgram();
    const primitives = [gl.POINTS, gl.LINES, gl.TRIANGLES];

    for (let i = 0; i < this.geometry.attributes.length; i++) {
      const { attributeName, buffer, stride } = this.geometry.attributes[i];
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer.getBuffer());
      const location = gl.getAttribLocation(program, attributeName);
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, stride, gl.FLOAT, false, 0, 0);
    }

    // indices
    gl.bindBuffer(
      gl.ELEMENT_ARRAY_BUFFER,
      this.geometry.indexBuffer.getBuffer()
    );

    // draw
    gl.drawElements(
      primitives[this.geometry.primitiveType],
      this.geometry.indices.length,
      gl.UNSIGNED_SHORT,
      0
    );
  }
}
