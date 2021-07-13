import GLObject from './GLObject.js';

export default class Renderbuffer extends GLObject {
  #gpu;
  #renderbuffer;
  #type;

  get glObject() {
    return this.#renderbuffer;
  }

  static Types = {
    Depth: 'Depth',
  };

  constructor({ gpu, type, width, height }) {
    super();

    if (!type) {
      throw 'should specified render buffer type';
    }

    this.#gpu = gpu;

    const gl = this.#gpu.gl;

    this.#type = type;

    this.#renderbuffer = gl.createRenderbuffer();

    gl.bindRenderbuffer(gl.RENDERBUFFER, this.#renderbuffer);

    if (this.#type === Renderbuffer.Types.Depth) {
      // render buffer を深度バッファに設定
      gl.renderbufferStorage(
        gl.RENDERBUFFER,
        gl.DEPTH_COMPONENT16,
        width,
        height,
      );
    }
  }

  setSize(width, height) {
    const gl = this.#gpu.gl;

    gl.bindRenderbuffer(gl.RENDERBUFFER, this.#renderbuffer);

    if (this.#type === Renderbuffer.Types.Depth) {
      // render buffer を深度バッファに設定
      gl.renderbufferStorage(
        gl.RENDERBUFFER,
        gl.DEPTH_COMPONENT16,
        width,
        height,
      );
    }
  }
}
