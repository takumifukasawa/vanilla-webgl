export default class GPU {
  static Primitives = {
    Point: 0,
    Line: 1,
    Triangle: 2,
  };
  static UniformTypes = {
    ProjectionMatrix: 0,
  };
  constructor({ canvasElement }) {
    this.gl = canvasElement.getContext('webgl2');
    this.geometry = null;
    this.material = null;
    this.camera = null;
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
  setGeometry(geometry) {
    this.geometry = geometry;
  }
  setMaterial(material) {
    this.material = material;
    const program = this.material.getProgram();
    this.gl.useProgram(program);
  }
  setCamera(camera) {
    this.camera = camera;
  }
  draw() {
    const gl = this.gl;
    const program = this.material.getProgram();
    const primitives = [gl.POINTS, gl.LINES, gl.TRIANGLES];

    for (let i = 0; i < this.geometry.attributes.length; i++) {
      const { name, buffer, stride } = this.geometry.attributes[i];
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer.getBuffer());
      const location = gl.getAttribLocation(program, name);
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, stride, gl.FLOAT, false, 0, 0);
    }

    // 特殊な扱いのmatrixは明示的にupdate
    if (this.material.uniforms) {
      const uniformProjectionMatrix = this.material.uniforms.find(
        (uniform) => uniform.type === GPU.UniformTypes.ProjectionMatrix
      );
      if (uniformProjectionMatrix) {
        uniformProjectionMatrix.data = this.camera.projectionMatrix.elements;
      }
    }

    for (let i = 0; i < this.material.uniforms.length; i++) {
      const { name, type, data } = this.material.uniforms[i];
      const location = gl.getUniformLocation(program, name);
      // NOTE: add type
      switch (type) {
        case GPU.UniformTypes.ProjectionMatrix:
          gl.uniformMatrix4fv(location, false, data);
          break;
        default:
          throw 'no uniform type';
      }
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
