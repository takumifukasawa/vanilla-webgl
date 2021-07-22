import GPU from './GPU.js';
import Shader from './Shader.js';
import Geometry from './Geometry.js';
import Engine from './Engine.js';
import Material from './Material.js';
import AbstractPostProcessPass from './AbstractPostProcessPass.js';

export default class PostProcessPass extends AbstractPostProcessPass {
  constructor({ gpu, fragmentShader, uniforms }) {
    super({ gpu });

    this.geometry = this.createPostProcessPlaneGeometry({ gpu });

    this.material = new Material({
      gpu,
      vertexShader: this.vertexShader,
      fragmentShader,
      uniforms: {
        ...(uniforms || {}),
        uSceneTexture: {
          type: Engine.UniformType.Texture2D,
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

    renderer.setupRenderStates({ material: this.material });

    renderer.renderMesh({ geometry: this.geometry, material: this.material });
  }
}
