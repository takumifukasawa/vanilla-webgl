import GPU from './GPU.js';
import Shader from './Shader.js';

export default class Material {
  #uniforms;
  #shader;
  #primitiveType;
  #blendType;
  #transparent;

  get uniforms() {
    return this.#uniforms;
  }

  get shader() {
    return this.#shader;
  }

  get primitiveType() {
    return this.#primitiveType;
  }

  get blendType() {
    return this.#blendType;
  }

  get transparent() {
    return this.#transparent;
  }

  constructor({
    gpu,
    vertexShader,
    fragmentShader,
    uniforms,
    primitiveType,
    transparent,
    blendType,
  }) {
    this.#uniforms = uniforms;
    this.#shader = new Shader({
      gpu,
      vertexShader,
      fragmentShader,
    });
    this.#primitiveType = primitiveType || GPU.Primitives.Triangles;
    this.#transparent = !!transparent;
    this.#blendType = GPU.BlendTypes.None;
    if (this.#transparent && blendType) {
      this.#blendType = blendType;
    }
  }

  // getTextureUniforms() {
  //   const textureUniforms = [];
  //   Object.keys(this.#uniforms).forEach((name) => {
  //     if (this.#uniforms[name].type === GPU.UniformTypes.Texture2D) {
  //       textureUniforms[name] = this.#uniforms[name];
  //     }
  //   });
  //   return textureUniforms;
  // }

  // 特殊な扱いのmatrixは明示的にupdate
  updateUniforms({
    modelMatrix,
    viewMatrix,
    projectionMatrix,
    normalMatrix,
    cameraPosition,
  }) {
    const uniformModelMatrix =
      this.#uniforms[
        Object.keys(this.#uniforms).find((name) => name === 'uModelMatrix')
      ];
    if (uniformModelMatrix) {
      uniformModelMatrix.data = modelMatrix;
    }

    const uniformInvModelMatrix =
      this.#uniforms[
        Object.keys(this.#uniforms).find((name) => name === 'uInvModelMatrix')
      ];
    if (uniformInvModelMatrix) {
      uniformInvModelMatrix.data = modelMatrix.clone().inverse();
    }

    const uniformViewMatrix =
      this.#uniforms[
        Object.keys(this.#uniforms).find((name) => name === 'uViewMatrix')
      ];
    if (uniformViewMatrix) {
      uniformViewMatrix.data = viewMatrix;
    }

    const uniformProjectionMatrix =
      this.#uniforms[
        Object.keys(this.#uniforms).find((name) => name === 'uProjectionMatrix')
      ];
    if (uniformProjectionMatrix) {
      uniformProjectionMatrix.data = projectionMatrix;
    }

    const uniformNormalMatrix =
      this.#uniforms[
        Object.keys(this.#uniforms).find((name) => name === 'uNormalMatrix')
      ];
    if (uniformNormalMatrix) {
      uniformNormalMatrix.data = normalMatrix;
    }

    const uniformCameraPosition =
      this.#uniforms[
        Object.keys(this.#uniforms).find((name) => name === 'uCameraPosition')
      ];
    if (uniformCameraPosition) {
      uniformCameraPosition.data = cameraPosition;
    }
  }
}
