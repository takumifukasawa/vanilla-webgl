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

  render({ renderer, cameraRenderTarget }) {
    this.#passes.forEach((pass, i) => {
      const isLastPass = i === this.#passes.length - 1;
      if (isLastPass) {
        // cameraのrenderTargetがついていたらそこに出力
        if (cameraRenderTarget) {
          renderer.setRenderTarget(cameraRenderTarget);
          renderer.clear();
        } else {
          renderer.clearRenderTarget();
          renderer.clear();
        }
      } else {
        renderer.setRenderTarget(this.getRenderTarget(i + 1));
        renderer.clear();
      }

      const { material, geometry } = pass;

      renderer.setupRenderStates({ material });

      pass.update({
        renderTarget: this.getRenderTarget(i),
      });

      renderer.renderMesh({ geometry, material });
    });
  }
}
