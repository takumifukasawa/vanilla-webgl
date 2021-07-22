import GPU from './libs/GPU.js';
import Shader from './libs/Shader.js';
import Geometry from './libs/Geometry.js';
import Engine from './libs/Engine.js';
import Material from './libs/Material.js';
import AbstractPostProcessPass from './libs/AbstractPostProcessPass.js';

export default class PostProcessRgbShiftMirrorYPass extends AbstractPostProcessPass {
  constructor({ gpu, fragmentShader, uniforms }) {
    super({ gpu });

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

  setSize(width, height) {}

  // 前フレームの描画済renderTargetが渡される
  update({ renderTarget }) {
    this.material.uniforms.uSceneTexture.data = renderTarget.texture;
  }
}
