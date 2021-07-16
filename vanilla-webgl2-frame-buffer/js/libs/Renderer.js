import Material from './Material.js';

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

  clear(r, g, b, a) {
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

  render({
    geometry,
    material,
    modelMatrix,
    viewMatrix,
    projectionMatrix,
    normalMatrix,
    cameraPosition,
  }) {
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
      case Material.Face.Front:
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
        break;
      case Material.Face.Back:
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.FRONT);
        break;
      case Material.Face.DoubleSide:
        gl.disable(gl.CULL_FACE);
        break;
      case Material.Face.None:
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
        case GPU.BlendTypes.Alpha:
          gl.blendFuncSeparate(
            gl.SRC_ALPHA,
            gl.ONE_MINUS_SRC_ALPHA,
            gl.ONE,
            gl.ONE,
          );
          break;
        case GPU.BlendTypes.Additive:
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

    material.updateUniforms({
      modelMatrix,
      viewMatrix,
      projectionMatrix,
      normalMatrix,
      cameraPosition,
    });

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
