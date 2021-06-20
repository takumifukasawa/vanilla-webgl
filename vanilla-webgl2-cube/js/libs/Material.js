import GPU from './GPU.js';

export default class Material {
  constructor({ gpu, vertexShader, fragmentShader, uniforms }) {
    this.uniforms = Object.keys(uniforms).reduce((acc, name) => {
      const { type, data } = uniforms[name];
      acc[name] = {
        type,
        data,
      };
      return acc;
    }, {});

    const gl = gpu.getGl();
    this.program = null;
    const vs = gl.createShader(gl.VERTEX_SHADER);
    const fs = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vs, vertexShader);
    gl.compileShader(vs);
    const vsInfo = gl.getShaderInfoLog(vs);
    if (vsInfo.length > 0) {
      throw vsInfo;
    }

    gl.shaderSource(fs, fragmentShader);
    gl.compileShader(fs);
    const fsInfo = gl.getShaderInfoLog(fs);
    if (fsInfo.length > 0) {
      throw fsInfo;
    }

    this.program = gl.createProgram();

    gl.attachShader(this.program, vs);
    gl.attachShader(this.program, fs);
    gl.linkProgram(this.program);
    gl.validateProgram(this.program);

    const programInfo = gl.getProgramInfoLog(this.program);
    if (programInfo.length > 0) {
      throw Info;
    }
  }
  getProgram() {
    return this.program;
  }
  // TODO: pass data to gpu
  render({ gpu, modelMatrix, viewMatrix, projectionMatrix }) {
    const gl = gpu.getGl();
    gl.useProgram(this.program);

    // 特殊な扱いのmatrixは明示的にupdate
    const uniformModelMatrix = Object.keys(this.uniforms)
      .map((name) => this.uniforms[name])
      .find((uniform) => uniform.type === GPU.UniformTypes.ModelMatrix);
    if (uniformModelMatrix) {
      uniformModelMatrix.data = modelMatrix.getArray();
    }

    const uniformViewMatrix = Object.keys(this.uniforms)
      .map((name) => this.uniforms[name])
      .find((uniform) => uniform.type === GPU.UniformTypes.ViewMatrix);
    if (uniformViewMatrix) {
      uniformViewMatrix.data = viewMatrix.getArray();
    }

    const uniformProjectionMatrix = Object.keys(this.uniforms)
      .map((name) => this.uniforms[name])
      .find((uniform) => uniform.type === GPU.UniformTypes.ProjectionMatrix);
    if (uniformProjectionMatrix) {
      uniformProjectionMatrix.data = projectionMatrix.getArray();
    }

    const uniformsKeys = Object.keys(this.uniforms);
    for (let i = 0; i < uniformsKeys.length; i++) {
      const name = uniformsKeys[i];
      const { type, data } = this.uniforms[name];
      const location = gl.getUniformLocation(this.program, name);
      // NOTE: add type
      switch (type) {
        case GPU.UniformTypes.Matrix4fv:
        case GPU.UniformTypes.ModelMatrix:
        case GPU.UniformTypes.ViewMatrix:
        case GPU.UniformTypes.ProjectionMatrix:
          gl.uniformMatrix4fv(location, false, data);
          break;
        default:
          throw 'no uniform type';
      }
    }
  }
}
