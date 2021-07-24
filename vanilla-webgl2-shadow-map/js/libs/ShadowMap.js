import Engine from './Engine.js';
import Framebuffer from './FrameBuffer.js';
import Texture from './Texture.js';

export default class ShadowMap {
  width;
  height;

  #framebuffer;
  #depthTexture;

  get framebuffer() {
    return this.#framebuffer;
  }

  constructor({ gpu, width = 1024, height = 1024 }) {
    const gl = gpu.gl;

    this.width = width;
    this.height = height;

    this.#depthTexture = new Texture({
      gpu,
      width,
      height,
      type: Engine.TextureType.Depth,
      mipmap: false,
    });

    this.#framebuffer = new Framebuffer({ gpu });

    // frame buffer に texture を紐付け
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.DEPTH_ATTACHMENT,
      gl.TEXTURE_2D,
      this.#depthTexture.glObject,
      0,
    );

    gl.bindTexture(gl.TEXTURE_2D, null);

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  setSize({ width, height }) {
    this.#depthTexture.setSize(width, height);
  }
}
