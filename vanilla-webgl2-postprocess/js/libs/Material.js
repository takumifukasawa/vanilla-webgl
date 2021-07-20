import GPU from './GPU.js';
import Shader from './Shader.js';
import Matrix4 from './Matrix4.js';
import Vector3 from './Vector3.js';
import Engine from './Engine.js';

export default class Material {
  #uniforms;
  #shader;
  #primitiveType;
  #blendType;
  #transparent;
  #face;
  #depthTest;
  #useUtilityUniforms;

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

  get face() {
    return this.#face;
  }

  get depthTest() {
    return this.#depthTest;
  }

  get useUtilityUniforms() {
    return this.#useUtilityUniforms;
  }

  constructor({
    gpu,
    vertexShader,
    fragmentShader,
    uniforms,
    primitiveType,
    transparent,
    blendType,
    face = Engine.FaceType.Front,
    depthTest = true,
    useUtilityUniforms = true,
  }) {
    this.#shader = new Shader({
      gpu,
      vertexShader,
      fragmentShader,
    });
    this.#primitiveType = primitiveType || Engine.PrimitiveType.Triangles;
    this.#transparent = !!transparent;
    this.#blendType = Engine.BlendType.None;

    if (this.#transparent && blendType) {
      this.#blendType = blendType;
    }

    this.#face = face;

    this.#depthTest = depthTest;

    this.#useUtilityUniforms = useUtilityUniforms;

    this.#uniforms = {
      ...uniforms,
      ...(useUtilityUniforms
        ? {
            uModelMatrix: {
              type: Engine.UniformType.Matrix4fv,
              data: Matrix4.identity(),
            },
            uInvModelMatrix: {
              type: Engine.UniformType.Matrix4fv,
              data: Matrix4.identity(),
            },
            uViewMatrix: {
              type: Engine.UniformType.Matrix4fv,
              data: Matrix4.identity(),
            },
            uProjectionMatrix: {
              type: Engine.UniformType.Matrix4fv,
              data: Matrix4.identity(),
            },
            uNormalMatrix: {
              type: Engine.UniformType.Matrix4fv,
              data: Matrix4.identity(),
            },
            uCameraPosition: {
              type: Engine.UniformType.Vector3f,
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
