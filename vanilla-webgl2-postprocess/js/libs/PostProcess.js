import RenderTarget from './RenderTarget.js';

export default class PostProcess {
  #passes;
  #renderTargets;

  get passes() {
    return this.#passes;
  }

  constructor({ gpu, passes }) {
    this.#passes = passes;
    this.#renderTargets = passes.map((pass, i) => new RenderTarget({ gpu }));
  }

  getRenderTarget(index) {
    return this.#renderTargets[index];
  }

  setSize(width, height) {
    this.#renderTargets.forEach((renderTarget) => {
      renderTarget.setSize(width, height);
    });
    this.#passes.forEach((pass) => {
      pass.setSize(width, height);
    });
  }
}
