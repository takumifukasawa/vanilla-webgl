import Framebuffer from './FrameBuffer';
import Texture from './Texture';

export default class ShadowMap {
  width;
  height;

  #framebuffer;

  constructor({ gpu, width = 1024, height = 1024 }) {
    this.width = width;
    this.height = height;

    this.depthTexture = new Texture({
      width,
      height,
    });

    this.#framebuffer = new Framebuffer({ gpu });
  }

  setSize({ width, height }) {}
}
