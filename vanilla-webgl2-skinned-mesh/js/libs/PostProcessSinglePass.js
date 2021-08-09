import { UniformType } from './Constants.js';
import Material from './Material.js';
import AbstractPostProcessPass from './AbstractPostProcessPass.js';

export default class PostProcessSinglePass extends AbstractPostProcessPass {
  constructor({ gpu, fragmentShader, uniforms }) {
    super({ gpu, needsCreateDefaultRenderTarget: true });

    this.geometry = this.createPostProcessPlaneGeometry({ gpu });

    this.material = new Material({
      gpu,
      vertexShader: this.vertexShader,
      fragmentShader,
      uniforms: {
        ...(uniforms || {}),
        uSceneTexture: {
          type: UniformType.Texture2D,
          data: null,
        },
      },
      depthTest: false,
      useUtilityUniforms: false,
    });
  }

  render({ renderer, beforePassRenderTarget, renderToCamera, renderTarget }) {
    this.material.uniforms.uSceneTexture.data = beforePassRenderTarget.texture;

    this.setupRenderTarget({ renderer, renderToCamera, renderTarget });

    renderer.clear();

    renderer.render({ geometry: this.geometry, material: this.material });
  }
}
