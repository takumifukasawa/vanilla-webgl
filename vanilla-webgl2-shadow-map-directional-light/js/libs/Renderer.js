import { FaceType, BlendType } from './Constants.js';
import Material from './Material.js';
import Matrix4 from './Matrix4.js';
import Vector3 from './Vector3.js';

const depthVertexShader = `#version 300 es

layout (location = 0) in vec3 aPosition;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

void main() {
  gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.);
}
`;

const depthFragmentShader = `#version 300 es

precision mediump float;

out vec4 outColor;

void main() {
  outColor = vec4(1.);
}
`;

export default class Renderer {
  #gpu;
  #renderTarget;
  #depthMaterial;
  #width;
  #height;

  constructor({ gpu }) {
    this.#gpu = gpu;

    this.#depthMaterial = new Material({
      gpu,
      vertexShader: depthVertexShader,
      fragmentShader: depthFragmentShader,
      useUtilityUniforms: true,
    });
  }

  setRenderTarget(renderTarget) {
    const gl = this.#gpu.gl;
    this.#renderTarget = renderTarget;
    if (this.#renderTarget) {
      gl.bindFramebuffer(
        gl.FRAMEBUFFER,
        this.#renderTarget.framebuffer.glObject,
      );
    }
  }

  clearRenderTarget() {
    const gl = this.#gpu.gl;
    this.#renderTarget = null;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  clear(r = 0, g = 0, b = 0, a = 1) {
    const gl = this.#gpu.gl;
    gl.clearColor(r, g, b, a);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // gl.flush();
    const e = gl.getError();
    if (e !== gl.NO_ERROR) {
      throw 'has gl error.';
    }
  }

  setSize(width, height) {
    this.#width = width;
    this.#height = height;
  }

  // TODO:
  // - camera に renderTarget が指定されている場合
  renderScene({ cameraActor, meshActors, lightActors }) {
    const { camera, postProcess } = cameraActor;

    // render shadow

    lightActors.forEach((lightActor) => {
      if (lightActor.castShadow) {
        const { light } = lightActor;

        const gl = this.#gpu.gl;
        gl.bindFramebuffer(
          gl.FRAMEBUFFER,
          lightActor.shadowMap.framebuffer.glObject,
        );
        this.#gpu.setSize(
          lightActor.shadowMap.width,
          lightActor.shadowMap.height,
        );
        this.clear();

        meshActors.forEach((meshActor, i) => {
          const { geometry } = meshActor;
          const material = this.#depthMaterial;
          if (material.useUtilityUniforms) {
            material.updateUniforms({
              modelMatrix: meshActor.transform.modelMatrix,
              // prettier-ignore
              viewMatrix: lightActor.shadowCamera.cameraMatrix.clone().inverse(),
              // prettier-ignore
              projectionMatrix: lightActor.shadowCamera.projectionMatrix.clone(),
              normalMatrix: Matrix4.identity(),
              cameraPosition: Vector3.zero(),
            });
          }
          this.render({ geometry, material });
        });

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      }
    });

    // 画面幅に戻す
    // TODO: post process 内でviewportのサイズを変えたい場面があるはず
    this.#gpu.setSize(this.#width, this.#height);

    // post process があったらオフスクリーン用のrenderTargetを指定しておく
    if (postProcess) {
      this.setRenderTarget(postProcess.renderTargetForScene);
    }
    this.clear();

    // TODO:
    // - opqque -> transparent -> ui
    meshActors.forEach((meshActor, i) => {
      const { geometry, material } = meshActor;

      if (material.useUtilityUniforms) {
        material.updateUniforms({
          modelMatrix: meshActor.transform.modelMatrix,
          viewMatrix: camera.cameraMatrix.clone().inverse(),
          projectionMatrix: camera.projectionMatrix,
          normalMatrix: meshActor.transform.modelMatrix
            .clone()
            .inverse()
            .transpose(),
          cameraPosition: camera.cameraMatrix.getTranslationVector(),
        });
      }

      // shadow map 適用
      lightActors.forEach((lightActor) => {
        if (lightActor.castShadow) {
          const { light } = lightActor;

          // for debug
          material.uniforms.uDepthMap.data = lightActor.shadowMap.depthTexture;

          // prettier-ignore
          const textureMatrix = new Matrix4(
              0.5, 0, 0, 0,
              0, 0.5, 0, 0,
              0, 0, 0.5, 0,
              0.5, 0.5, 0.5, 1
            );
          const textureProjectionMatrix = Matrix4.multiplyMatrices(
            textureMatrix,
            lightActor.shadowCamera.projectionMatrix.clone(),
            lightActor.shadowCamera.cameraMatrix.clone().inverse(),
          );

          material.uniforms.uTextureProjectionMatrix.data =
            textureProjectionMatrix;
        }
      });

      this.render({ geometry, material });
    });

    if (postProcess) {
      postProcess.render({
        renderer: this,
        cameraRenderTarget: cameraActor.camera.renderTarget,
      });
    }
  }

  setupRenderStates({ material }) {
    // stateの切り替えはアプリケーションレベルで行う
    const gl = this.#gpu.gl;

    // check depth
    if (material.depthTest) {
      gl.enable(gl.DEPTH_TEST);
    } else {
      gl.disable(gl.DEPTH_TEST);
    }

    // culling
    switch (material.face) {
      case FaceType.Front:
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
        break;
      case FaceType.Back:
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.FRONT);
        break;
      case FaceType.DoubleSide:
        gl.disable(gl.CULL_FACE);
        break;
      case FaceType.None:
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.FRONT_AND_BACK);
        break;
      default:
        throw 'invalid material face parameter';
    }

    if (material.transparent) {
      gl.depthMask(false);
      gl.enable(gl.BLEND);
      switch (material.blendType) {
        case BlendType.Alpha:
          gl.blendFuncSeparate(
            gl.SRC_ALPHA,
            gl.ONE_MINUS_SRC_ALPHA,
            gl.ONE,
            gl.ONE,
          );
          break;
        case BlendType.Additive:
          gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ONE, gl.ONE);
          break;
        default:
          throw 'should specify blend type';
      }
    } else {
      gl.depthMask(true);
      gl.depthFunc(gl.LEQUAL);
      gl.disable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ZERO);
    }
  }

  render({ geometry, material }) {
    this.setupRenderStates({ material });

    this.#gpu.setShader(material.shader);
    this.#gpu.setVertex(geometry.vao);
    // gpu.setAttributes(geometry.attributes);
    // gpu.setTextures(material.textures);
    this.#gpu.setUniforms(material.uniforms);
    if (geometry.indices) {
      this.#gpu.setIndices(geometry.indices);
      this.#gpu.draw(geometry.indices.length, material.primitiveType);
    } else {
      // TODO: attributeのvertexにtypeをもたせる
      this.#gpu.draw(geometry.vertexCount, material.primitiveType);
    }
    this.#gpu.resetData();
  }
}
