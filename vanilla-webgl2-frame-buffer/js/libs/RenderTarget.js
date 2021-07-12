import Framebuffer from './FrameBuffer.js';
import Renderbuffer from './Renderbuffer.js';
import Texture from './Texture.js';

export default class RenderTarget {
  #texture;
  #framebuffer;
  #depthRenderbuffer;

  constructor({ gpu, width, height }) {
    const gl = gpu.gl;

    this.#framebuffer = new Framebuffer({ gpu });
    this.#depthRenderbuffer = new Renderbuffer({ gpu });

    // frame buffer を webgl に bind
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.#framebuffer.glObject);

    // depth buffer を webgl に bind
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.#depthRenderbuffer.glObject);

    // render buffer を深度バッファに設定
    gl.renderbufferStorage(
      gl.RENDERBUFFER,
      gl.DEPTH_COMPONENT16,
      width,
      height,
    );

    // frame buffer に render buffer を紐付け
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
      wrapS: Texture.Wrap.ClampToEdge,
      wrapT: Texture.Wrap.ClampToEdge,
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

    gpu.unbindTexture();
    gpu.unbindRenderbuffer();
    gpu.unbindFramebuffer();
  }
}
