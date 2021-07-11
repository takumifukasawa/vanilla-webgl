import GPU from './GPU.js';
import Shader from './Shader.js';
import { Matrix4 } from './Matrix4.js';
import { Vector3 } from './Vector3.js';

export default class Material {
  #uniforms;
  #shader;
  #primitiveType;
  #blendType;
  #transparent;
  #useCommonUniforms;

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
    useUtilityUniforms = true,
  }) {
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

    this.#uniforms = {
      ...uniforms,
      ...(useUtilityUniforms
        ? {
            uModelMatrix: {
              type: GPU.UniformTypes.Matrix4fv,
              data: Matrix4.identity(),
            },
            uInvModelMatrix: {
              type: GPU.UniformTypes.Matrix4fv,
              data: Matrix4.identity(),
            },
            uViewMatrix: {
              type: GPU.UniformTypes.Matrix4fv,
              data: Matrix4.identity(),
            },
            uProjectionMatrix: {
              type: GPU.UniformTypes.Matrix4fv,
              data: Matrix4.identity(),
            },
            uNormalMatrix: {
              type: GPU.UniformTypes.Matrix4fv,
              data: Matrix4.identity(),
            },
            uCameraPosition: {
              type: GPU.UniformTypes.Vector3f,
              data: Vector3.one(),
            },
          }
        : {}),
    };
  }

  // NOTE:
  // - transform などの matrix 更新
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
