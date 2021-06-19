export default class GPU {
  static Primitives = {
    Point: 0,
    Line: 1,
    Triangle: 2,
  };
  constructor({ canvasElement }) {
    this.gl = canvasElement.getContext('webgl2');
    this.vertexBuffer = null;
    this.vertexFormat = null;
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
  setVertexBuffer(vertexBuffer) {
    this.vertexBuffer = vertexBuffer;
  }
  setMaterial(material) {
    this.material = material;
    const program = this.material.getProgram();
    this.gl.useProgram(program);
  }
  setVertexFormat(vertexFormat) {
    this.vertexFormat = vertexFormat;
  }
  draw(
    vertexCount,
    primitiveType = GPU.Primitives.Triangle,
    startVertexIndex = 0
  ) {
    const gl = this.gl;
    const primitives = [gl.POINTS, gl.LINES, gl.TRIANGLES];
    gl.drawElements(
      primitives[primitiveType],
      vertexCount,
      gl.UNSIGNED_SHORT,
      startVertexIndex
    );
  }
}
