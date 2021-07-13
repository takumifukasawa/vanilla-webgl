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

  constructor({ gpu, width, height }) {
    const gl = gpu.gl;

    this.#framebuffer = new Framebuffer({ gpu });

    // // frame buffer を webgl に bind
    // gpu.bindFramebuffer(this.#framebuffer);

    this.#depthRenderbuffer = new Renderbuffer({
      gpu,
      width: 1,
      height: 1,
      type: Renderbuffer.Types.Depth,
    });

    // depth buffer を webgl に bind
    // gpu.bindRenderbuffer(this.#depthRenderbuffer);

    // frame buffer に render buffer を紐付け
    // TODO: depthかどうかで出し訳
    gl.framebufferRenderbuffer(
      gl.FRAMEBUFFER,
      gl.DEPTH_ATTACHMENT,
      gl.RENDERBUFFER,
      this.#depthRenderbuffer.glObject,
    );

    this.#texture = new Texture({
      gpu,
      width: 1,
      height: 1,
      mipmap: false,
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
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  setSize(width, height) {
    this.#texture.setSize(width, height);
    this.#depthRenderbuffer.setSize(width, height);
  }
}
