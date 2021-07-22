import RenderTarget from './RenderTarget.js';

export default class PostProcess {
  #passes;
  #renderTargetForScene;

  get passes() {
    return this.#passes;
  }

  get renderTargetForScene() {
    return this.#renderTargetForScene;
  }

  constructor({ gpu, passes }) {
    this.#passes = passes;
    this.#renderTargetForScene = new RenderTarget({ gpu });
  }

  setSize(width, height) {
    this.renderTargetForScene.setSize(width, height);
    this.#passes.forEach((pass) => {
      pass.setSize(width, height);
    });
  }

  render({ renderer, cameraRenderTarget }) {
    this.#passes.forEach((pass, i) => {
      const isLastPass = i === this.#passes.length - 1;

      const renderToCamera = isLastPass && !cameraRenderTarget;
      const renderTarget =
        isLastPass && cameraRenderTarget ? cameraRenderTarget : null;
      const beforePassRenderTarget =
        i === 0 ? this.#renderTargetForScene : this.passes[i - 1].renderTarget;

      pass.render({
        renderer,
        beforePassRenderTarget,
        renderToCamera,
        renderTarget,
      });
    });
  }
}
