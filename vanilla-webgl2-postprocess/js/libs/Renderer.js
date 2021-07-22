import Engine from './Engine.js';
import GPU from './GPU.js';

export default class Renderer {
  #renderTarget;
  #gpu;

  constructor({ gpu }) {
    this.#gpu = gpu;
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

  // TODO:
  // - camera に renderTarget が指定されている場合
  render({ cameraActor, meshActors }) {
    const { camera, postProcess } = cameraActor;

    if (postProcess) {
      this.setRenderTarget(postProcess.renderTargetForScene);
    }
    this.clear();

    // TODO:
    // - opqque -> transparent -> ui
    meshActors.forEach((meshActor, i) => {
      const { geometry, material } = meshActor.meshComponent;

      this.setupRenderStates({ material });

      if (material.useUtilityUniforms) {
        material.updateUniforms({
          modelMatrix: meshActor.worldTransform,
          viewMatrix: camera.cameraMatrix.clone().inverse(),
          projectionMatrix: camera.projectionMatrix,
          normalMatrix: meshActor.worldTransform.clone().inverse().transpose(),
          cameraPosition: camera.cameraMatrix.getTranslationVector(),
        });
      }

      this.renderMesh({ geometry, material });
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
      case Engine.FaceType.Front:
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
        break;
      case Engine.FaceType.Back:
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.FRONT);
        break;
      case Engine.FaceType.DoubleSide:
        gl.disable(gl.CULL_FACE);
        break;
      case Engine.FaceType.None:
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
        case Engine.BlendType.Alpha:
          gl.blendFuncSeparate(
            gl.SRC_ALPHA,
            gl.ONE_MINUS_SRC_ALPHA,
            gl.ONE,
            gl.ONE,
          );
          break;
        case Engine.BlendType.Additive:
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

  renderMesh({ geometry, material }) {
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
