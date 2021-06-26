import GPU from './../GPU.js';
import Shader from '../Shader.js';

export default class Material {
  constructor({ gpu, vertexShader, fragmentShader, uniforms, primitiveType }) {
    this.uniforms = uniforms;
    this.shader = new Shader({
      gpu,
      vertexShader,
      fragmentShader,
    });
    this.primitiveType = primitiveType || GPU.Primitives.Triangles;
  }

  // getTextureUniforms() {
  //   const textureUniforms = [];
  //   Object.keys(this.uniforms).forEach((name) => {
  //     if (this.uniforms[name].type === GPU.UniformTypes.Texture2D) {
  //       textureUniforms[name] = this.uniforms[name];
  //     }
  //   });
  //   return textureUniforms;
  // }

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
