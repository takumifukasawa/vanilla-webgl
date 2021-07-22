import GPU from './libs/GPU.js';
import Shader from './libs/Shader.js';
import Geometry from './libs/Geometry.js';
import Engine from './libs/Engine.js';
import Material from './libs/Material.js';
import AbstractPostProcessPass from './libs/AbstractPostProcessPass.js';
import RenderTarget from './libs/RenderTarget.js';

const rgbShiftFragmentShader = `#version 300 es

precision mediump float;

uniform sampler2D uSceneTexture;

in vec2 vUv;

out vec4 outColor;

void main() {
  outColor = texture(uSceneTexture, vUv);
}
`;

const mirrorYFragmentShader = `#version 300 es

precision mediump float;

uniform sampler2D uSceneTexture;

in vec2 vUv;

out vec4 outColor;

void main() {
  outColor = texture(uSceneTexture, vUv);
}
`;

export default class PostProcessRgbShiftMirrorYPass extends AbstractPostProcessPass {
  constructor({ gpu }) {
    super({ gpu, needsCreateRenderTarget: false });

    this.rgbShiftGeometry = this.createPostProcessPlaneGeometry({ gpu });
    this.rgbShiftMaterial = new Material({
      gpu,
      vertexShader: this.vertexShader,
      fragmentShader: rgbShiftFragmentShader,
      uniforms: {
        uSceneTexture: {
          type: Engine.UniformType.Texture2D,
          data: null,
        },
      },
      depthTest: false,
      useUtilityUniforms: false,
    });
    this.rgbShiftRenderTarget = new RenderTarget({ gpu });

    this.mirrorYGeometry = this.createPostProcessPlaneGeometry({ gpu });
    this.mirrorYMaterial = new Material({
      gpu,
      vertexShader: this.vertexShader,
      fragmentShader: mirrorYFragmentShader,
      uniforms: {
        uSceneTexture: {
          type: Engine.UniformType.Texture2D,
          data: null,
        },
      },
      depthTest: false,
      useUtilityUniforms: false,
    });
    this.mirrorYRenderTarget = new RenderTarget({ gpu });
  }

  getRenderTarget() {
    return this.mirrorYRenderTarget;
  }

  setSize(width, height) {
    this.rgbShiftRenderTarget.setSize(width, height);
    this.mirrorYRenderTarget.setSize(width, height);
  }

  render({ renderer, beforePassRenderTarget, renderToCamera, renderTarget }) {
    // 1. render rgb shift

    this.rgbShiftMaterial.uniforms.uSceneTexture.data =
      beforePassRenderTarget.texture;

    this.setupRenderTarget({
      renderer,
      renderToCamera: false,
      renderTarget: this.rgbShiftRenderTarget,
    });

    renderer.clear();

    renderer.setupRenderStates({ material: this.rgbShiftMaterial });

    renderer.renderMesh({
      geometry: this.rgbShiftGeometry,
      material: this.rgbShiftMaterial,
    });

    // 2. mirror Y

    this.mirrorYMaterial.uniforms.uSceneTexture.data =
      this.rgbShiftRenderTarget.texture;

    this.setupRenderTarget({
      renderer,
      renderToCamera,
      renderTarget,
    });

    renderer.clear();

    renderer.setupRenderStates({ material: this.mirrorYMaterial });

    renderer.renderMesh({
      geometry: this.mirrorYGeometry,
      material: this.mirrorYMaterial,
    });
  }
}
