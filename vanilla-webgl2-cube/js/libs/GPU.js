export default class GPU {
  static Primitives = {
    Point: 0,
    Line: 1,
    Triangle: 2,
  };
  static UniformTypes = {
    Matrix4fv: 0,
    // ModelMatrix: 1,
    // ViewMatrix: 2,
    // ProjectionMatrix: 3,
  };
  constructor({ canvasElement }) {
    this.gl = canvasElement.getContext('webgl2');
    this.geometry = null;
    this.material = null;
    this.camera = null;
    this.shader = null;
    this.attributes = null;
    this.uniforms = null;
    this.indices = null;
  }
  setShader(shader) {
    this.shader = shader;
  }
  setAttributes(attributes) {
    this.attributes = attributes;
  }
  setIndices(indices) {
    this.indices = indices;
  }
  setUniforms(uniforms) {
    this.uniforms = uniforms;
  }
  resetData() {
    this.shader = null;
    this.attributes = null;
    this.uniforms = null;
    this.indices = null;
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
  draw(vertexCount, primitiveType, startVertexOffset = 0) {
    const gl = this.gl;
    const program = this.shader.getProgram();

    gl.useProgram(program);

    const primitives = [gl.POINTS, gl.LINES, gl.TRIANGLES];

    const attributeKeys = Object.keys(this.attributes);
    for (let i = 0; i < attributeKeys.length; i++) {
      const name = attributeKeys[i];
      const { buffer, stride } = this.attributes[name];
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer.getBuffer());
      const location = gl.getAttribLocation(program, name);
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, stride, gl.FLOAT, false, 0, 0);
    }

    // indices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indices.buffer.getBuffer());

    const uniformsKeys = Object.keys(this.uniforms);
    for (let i = 0; i < uniformsKeys.length; i++) {
      const name = uniformsKeys[i];
      const { type, data } = this.uniforms[name];
      const location = gl.getUniformLocation(program, name);
      // NOTE: add type
      switch (type) {
        case GPU.UniformTypes.Matrix4fv:
          // case GPU.UniformTypes.ModelMatrix:
          // case GPU.UniformTypes.ViewMatrix:
          // case GPU.UniformTypes.ProjectionMatrix:
          gl.uniformMatrix4fv(location, false, data);
          break;
        default:
          throw 'no uniform type';
      }
    }

    // draw
    gl.drawElements(
      primitives[primitiveType],
      vertexCount,
      gl.UNSIGNED_SHORT,
      startVertexOffset
    );
  }
}
