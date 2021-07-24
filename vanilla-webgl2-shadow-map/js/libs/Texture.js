import Engine from './Engine.js';
import GLObject from './GLObject.js';

export default class Texture extends GLObject {
  #texture;
  #img;
  #gpu;
  #type;

  get glObject() {
    return this.#texture;
  }

  constructor({
    gpu,
    img = null,
    width,
    height,
    mipmap = true,
    wrapS = Engine.TextureWrapType.ClampToEdge,
    wrapT = Engine.TextureWrapType.ClampToEdge,
    flipY = true,
    type = Engine.TextureType.Rgba,
  }) {
    super(gpu);

    this.#gpu = gpu;

    this.#img = img;

    this.#type = type;

    const gl = this.#gpu.gl;

    this.#texture = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, this.#texture);

    // NOTE:
    // - imgがない時も呼ばれるようにしてもいいかもしれない
    if (this.#img) {
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, !!flipY);
    }

    switch (type) {
      case Engine.TextureType.Rgba:
        if (width && height) {
          // prettier-ignore
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.#img);
        } else {
          // prettier-ignore
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.#img);
        }
        break;
      case Engine.TextureType.Depth:
        if (width && height) {
          // prettier-ignore
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT32F, width, height, 0, gl.DEPTH_COMPONENT, gl.FLOAT, this.#img);
        } else {
          // prettier-ignore
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT32F, gl.DEPTH_COMPONENT, gl.FLOAT, this.#img);
        }
        break;
    }

    // TODO: flag
    if (mipmap) {
      gl.generateMipmap(gl.TEXTURE_2D);
    }

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    switch (wrapS) {
      case Engine.TextureWrapType.Repeat:
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        break;
      case Engine.TextureWrapType.ClampToEdge:
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        break;
    }
    switch (wrapT) {
      case Engine.TextureWrapType.Repeat:
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        break;
      case Engine.TextureWrapType.ClampToEdge:
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        break;
    }

    // NOTE: constructorの最後にやるべき？
    // gl.bindTexture(gl.TEXTURE_2D, null);
  }

  setSize(width, height) {
    const gl = this.#gpu.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.#texture);
    // prettier-ignore
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.#img);
  }
}
