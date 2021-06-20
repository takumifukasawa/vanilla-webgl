import GPU from './GPU.js';
import Shader from './Shader.js';

export default class Material {
  constructor({ gpu, vertexShader, fragmentShader, uniforms }) {
    this.uniforms = uniforms;
    this.shader = new Shader({
      gpu,
      vertexShader,
      fragmentShader,
    });
  }
  // TODO: pass data to gpu
  render({ modelMatrix, viewMatrix, projectionMatrix }) {
    // const gl = gpu.getGl();
    // gl.useProgram(this.shader.getProgram());

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

    // const uniformsKeys = Object.keys(this.uniforms);
    // for (let i = 0; i < uniformsKeys.length; i++) {
    //   const name = uniformsKeys[i];
    //   const { type, data } = this.uniforms[name];
    //   const location = gl.getUniformLocation(this.program, name);
    //   // NOTE: add type
    //   switch (type) {
    //     case GPU.UniformTypes.Matrix4fv:
    //     case GPU.UniformTypes.ModelMatrix:
    //     case GPU.UniformTypes.ViewMatrix:
    //     case GPU.UniformTypes.ProjectionMatrix:
    //       gl.uniformMatrix4fv(location, false, data);
    //       break;
    //     default:
    //       throw 'no uniform type';
    //   }
    // }
  }
}
