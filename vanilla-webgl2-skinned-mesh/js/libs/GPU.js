import Texture from './Texture.js';
import { PrimitiveType, UniformType } from './Constants.js';

const createWhite1x1 = () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 1;
  canvas.height = 1;
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, 1, 1);
  return canvas;
};

export default class GPU {
  #gl;
  constructor({ canvasElement }) {
    this.#gl = canvasElement.getContext('webgl2');
    this.shader = null;
    // this.attributes = null;
    this.uniforms = null;
    this.indices = null;
    this.dummyTexture = new Texture({ gpu: this, img: createWhite1x1() });
  }
  setShader(shader) {
    this.shader = shader;
  }
  // setAttributes(attributes) {
  //   this.attributes = attributes;
  // }
  setVertex(vao) {
    this.vao = vao;
  }
  setIndices(indices) {
    this.indices = indices;
  }
  setUniforms(uniforms) {
    this.uniforms = uniforms;
  }
  setTextures() {}
  resetData() {
    this.shader = null;
    // this.attributes = null;
    this.vao = null;
    this.uniforms = null;
    this.indices = null;
  }
  setSize(width, height) {
    this.#gl.viewport(0, 0, width, height);
  }
  flush() {
    this.#gl.flush();
  }
  // clear(r, g, b, a) {
  //   const gl = this.#gl;
  //   gl.clearColor(r, g, b, a);
  //   gl.clearDepth(1.0);
  //   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  //   // gl.flush();
  //   const e = gl.getError();
  //   if (e !== gl.NO_ERROR) {
  //     throw 'has gl error.';
  //   }
  // }
  get gl() {
    return this.#gl;
  }

  // bindTexture(texture) {
  //   this.#gl.bindTexture(this.#gl.TEXTURE_2D, texture.glObject);
  // }
  // bindRenderbuffer(renderBuffer) {
  //   this.#gl.bindRenderbuffer(this.#gl.RENDERBUFFER, renderBuffer.glObject);
  // }
  // bindFramebuffer(framebuffer) {
  //   this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, framebuffer.glObject);
  // }

  // unbindTexture() {
  //   this.#gl.bindTexture(this.#gl.TEXTURE_2D, null);
  // }
  // unbindRenderbuffer() {
  //   this.#gl.bindRenderbuffer(this.#gl.RENDERBUFFER, null);
  // }
  // unbindFramebuffer() {
  //   this.#gl.bindFramebuffer(this.#gl.FRAMEBUFFER, null);
  // }

  // unbindTexture() {
  //   this.#gl.bindTexture(gl.TEXTURE_2D, null);
  //   this.#gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
  // }
  draw(vertexCount, primitiveType, startVertexOffset = 0) {
    const gl = this.#gl;
    const program = this.shader.glObject;

    // unbind texture
    // NOTE: resetDataの方でやるべき？
    // gl.bindTexture(gl.TEXTURE_2D, null);
    // gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
    // this.unbindTexture();
    // gl.bindTexture(gl.TEXTURE_2D, null);
    // gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    // gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    gl.useProgram(program);

    const primitives = {
      [PrimitiveType.Points]: gl.POINTS,
      [PrimitiveType.Lines]: gl.LINES,
      [PrimitiveType.Triangles]: gl.TRIANGLES,
    };

    gl.bindVertexArray(this.vao.glObject);

    // const attributeKeys = Object.keys(this.attributes);
    // for (let i = 0; i < attributeKeys.length; i++) {
    //   const name = attributeKeys[i];
    //   const { buffer, stride } = this.attributes[name];
    //   gl.bindBuffer(gl.ARRAY_BUFFER, buffer.getBuffer());
    //   const location = gl.getAttribLocation(program, name);
    //   gl.enableVertexAttribArray(location);
    //   gl.vertexAttribPointer(location, stride, gl.FLOAT, false, 0, 0);
    // }

    // init textures
    let activeTextureIndex = 0;
    // NOTE:
    // - glから最大テクスチャ割当可能数を取得して動的に設定してもよい
    // - 連番なので列挙しなくてもよい
    const textureUnits = [
      gl.TEXTURE0,
      gl.TEXTURE1,
      gl.TEXTURE2,
      gl.TEXTURE3,
      gl.TEXTURE4,
      gl.TEXTURE5,
      gl.TEXTURE6,
      gl.TEXTURE7,
    ];

    // uniforms
    // refs: https://developer.mozilla.org/ja/docs/Web/API/WebGLRenderingContext/uniformMatrix
    const uniformsKeys = Object.keys(this.uniforms);
    for (let i = 0; i < uniformsKeys.length; i++) {
      const name = uniformsKeys[i];
      const { type, data } = this.uniforms[name];
      const location = gl.getUniformLocation(program, name);
      // NOTE: add type
      switch (type) {
        case UniformType.Float:
          gl.uniform1f(location, data);
          break;
        case UniformType.Matrix4fv:
          // 第二引数はtransposeのフラグ。必ずfalseにする必要がある
          if (Array.isArray(data)) {
            // prettier-ignore
            gl.uniformMatrix4fv(location, false, ...(data.map(m => m.getArray())));
          } else {
            gl.uniformMatrix4fv(location, false, data.getArray());
          }
          break;
        case UniformType.Vector3f:
          gl.uniform3fv(location, data.getArray());
          break;
        case UniformType.Texture2D:
        case UniformType.CubeMap:
          // TODO: textureが最大数よりも大きくなるときの対応が必要
          const texture = data ? data : this.dummyTexture.glObject;
          gl.activeTexture(textureUnits[activeTextureIndex]);
          gl.bindTexture(
            type === UniformType.Texture2D
              ? gl.TEXTURE_2D
              : gl.TEXTURE_CUBE_MAP,
            texture.glObject,
          );
          gl.uniform1i(location, activeTextureIndex);
          activeTextureIndex++;
          break;
        default:
          throw 'invalid uniform type';
      }
    }

    // indices
    // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indices.buffer.getBuffer());
    // draw
    // gl.drawElements(
    //   primitives[primitiveType],
    //   vertexCount,
    //   gl.UNSIGNED_SHORT,
    //   startVertexOffset,
    // );

    // TODO: indicesがあるかないかどうかでも見るべき？
    if (this.indices) {
      // indices
      // gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indices.buffer.getBuffer());
      // draw
      gl.drawElements(
        primitives[primitiveType],
        vertexCount,
        gl.UNSIGNED_SHORT,
        startVertexOffset,
      );
    } else {
      gl.drawArrays(primitives[primitiveType], startVertexOffset, vertexCount);
    }

    // if (primitiveType === GPU.Primitives.Points) {
    //   // 第一引数は実質pointのみ
    //   gl.drawArrays(primitives[primitiveType], startVertexOffset, vertexCount);
    // } else {
    //   // indices
    //   gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indices.buffer.getBuffer());
    //   // draw
    //   gl.drawElements(
    //     primitives[primitiveType],
    //     vertexCount,
    //     gl.UNSIGNED_SHORT,
    //     startVertexOffset
    //   );
    // }
  }
}
