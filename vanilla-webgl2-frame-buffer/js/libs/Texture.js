import GLObject from './GLObject.js';

export default class Texture extends GLObject {
  #texture;
  #img;
  #gpu;

  static Wrap = {
    Repeat: 'Repeat',
    ClampToEdge: 'ClampToEdge',
  };

  get glObject() {
    return this.#texture;
  }

  constructor({
    gpu,
    img,
    width,
    height,
    mipmap = true,
    wrapS = Texture.Wrap.ClampToEdge,
    wrapT = Texture.Wrap.ClampToEdge,
  }) {
    super(gpu);

    this.#gpu = gpu;

    this.#img = img || null;

    const gl = this.#gpu.gl;

    this.#texture = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, this.#texture);

    if (width && height) {
      // prettier-ignore
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.#img);
    } else {
      // prettier-ignore
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.#img);
    }

    // TODO: flag
    if (mipmap) {
      gl.generateMipmap(gl.TEXTURE_2D);
    }

    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    switch (wrapS) {
      case Texture.Wrap.Repeat:
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        break;
      case Texture.Wrap.ClampToEdge:
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        break;
    }
    switch (wrapT) {
      case Texture.Wrap.Repeat:
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        break;
      case Texture.Wrap.ClampToEdge:
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
