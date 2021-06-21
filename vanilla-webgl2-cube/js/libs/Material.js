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

  updateUniforms({ modelMatrix, viewMatrix, projectionMatrix }) {
    // 特殊な扱いのmatrixは明示的にupdate
    const uniformModelMatrix =
      this.uniforms[
        Object.keys(this.uniforms).find((name) => name === 'uModelMatrix')
      ];
    if (uniformModelMatrix) {
      uniformModelMatrix.data = modelMatrix.getArray();
    }

    const uniformViewMatrix =
      this.uniforms[
        Object.keys(this.uniforms).find((name) => name === 'uViewMatrix')
      ];
    if (uniformViewMatrix) {
      uniformViewMatrix.data = viewMatrix.getArray();
    }

    const uniformProjectionMatrix =
      this.uniforms[
        Object.keys(this.uniforms).find((name) => name === 'uProjectionMatrix')
      ];
    if (uniformProjectionMatrix) {
      uniformProjectionMatrix.data = projectionMatrix.getArray();
    }
  }
}
