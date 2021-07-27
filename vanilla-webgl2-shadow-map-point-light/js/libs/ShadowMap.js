import Engine from './Engine.js';
import Framebuffer from './FrameBuffer.js';
import Texture from './Texture.js';

export default class ShadowMap {
  width;
  height;

  #gpu;
  #framebuffer;
  #depthTexture;

  get framebuffer() {
    return this.#framebuffer;
  }

  get depthTexture() {
    return this.#depthTexture;
  }

  constructor({ gpu, width = 512, height = 512 }) {
    this.#gpu = gpu;

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
}
