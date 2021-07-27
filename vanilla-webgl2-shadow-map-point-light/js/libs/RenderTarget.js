import Engine from './Engine.js';
import Framebuffer from './FrameBuffer.js';
import Renderbuffer from './Renderbuffer.js';
import Texture from './Texture.js';

export default class RenderTarget {
  #texture;
  #framebuffer;
  #depthRenderbuffer;

  get texture() {
    return this.#texture;
  }

  get framebuffer() {
    return this.#framebuffer;
  }

  get depthRenderbuffer() {
    return this.#depthRenderbuffer;
  }

  constructor({ gpu, width = 1, height = 1, useDepth = true }) {
    const gl = gpu.gl;

    this.#framebuffer = new Framebuffer({ gpu });

    // // frame buffer を webgl に bind
    // gpu.bindFramebuffer(this.#framebuffer);

    if (useDepth) {
      this.#depthRenderbuffer = new Renderbuffer({
        gpu,
        width,
        height,
        // width: 1,
        // height: 1,
        type: Engine.RenderbufferType.Depth,
      });
    }

    // depth buffer を webgl に bind
    // gpu.bindRenderbuffer(this.#depthRenderbuffer);

    if (this.#depthRenderbuffer) {
      // frame buffer に render buffer を紐付け
      this.#depthRenderbuffer.bind();
    }

    this.#texture = new Texture({
      gpu,
      width: 1,
      height: 1,
      mipmap: false,
      flipY: true,
    });

    // frame buffer に texture を紐付け
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0,
      gl.TEXTURE_2D,
      this.#texture.glObject,
      0,
    );

    // gpu.unbindTexture();
    // gpu.unbindRenderbuffer();
    // gpu.unbindFramebuffer();

    gl.bindTexture(gl.TEXTURE_2D, null);
    if (this.#depthRenderbuffer) {
      this.#depthRenderbuffer.unbind();
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  setSize(width, height) {
    this.#texture.setSize(width, height);
    if (this.#depthRenderbuffer) {
      this.#depthRenderbuffer.setSize(width, height);
    }
  }
}
