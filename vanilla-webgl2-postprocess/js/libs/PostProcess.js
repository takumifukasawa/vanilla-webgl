import RenderTarget from './libs/RenderTarget.js';

export default class PostProcess {
  #material;

  constructor({ gpu, material, outputToScreen = true }) {
    this.renderTarget = new RenderTarget({ gpu });
    this.outputToScreen = this.#material = material;
  }
  render() {}
}
