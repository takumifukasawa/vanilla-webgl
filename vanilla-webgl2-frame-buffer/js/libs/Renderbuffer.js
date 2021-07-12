import GLObject from './GLObject.js';

export default class Renderbuffer extends GLObject {
  #renderbuffer;

  get glObject() {
    return this.#renderbuffer;
  }

  constructor({ gpu }) {
    super();

    const gl = gpu.gl;

    this.#renderbuffer = gl.createRenderbuffer();
  }
}
