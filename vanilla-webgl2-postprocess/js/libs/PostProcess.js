import RenderTarget from './RenderTarget.js';

export default class PostProcess {
  #passes;

  get passes() {
    return this.#passes;
  }

  getRenderTarget(index) {
    return this.passes[index].renderTarget;
  }

  constructor({ gpu, passes }) {
    this.#passes = passes;
  }

  setSize(width, height) {
    this.#passes.forEach((pass) => {
      pass.setSize(width, height);
    });
  }
}
