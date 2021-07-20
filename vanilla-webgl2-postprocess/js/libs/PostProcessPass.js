import GPU from './GPU.js';
import Shader from './Shader.js';
import Geometry from './Geometry.js';
import Engine from './Engine.js';
import Material from './Material.js';

//
// plane vertex positions
//
// 3 ----------2
// |         / |
// |       /   |
// |     /     |
// |   /       |
// | /         |
// 0 --------- 1
//

const vertexShader = `#version 300 es

layout (location = 0) in vec3 aPosition;
layout (location = 1) in vec2 aUv;

out vec2 vUv;

void main() {
  vUv = aUv;
  gl_Position = vec4(aPosition, 1.);
}
`;

export default class PostProcessPass {
  constructor({ gpu, fragmentShader, uniforms }) {
    this.geometry = new Geometry({
      gpu,
      attributes: [
        {
          type: Engine.AttributeType.Position,
          // prettier-ignore
          data: [
            -1, -1, 0,
            1, -1, 0,
            1, 1, 0,
            -1, 1, 0,
        ],
          stride: 3,
        },
        {
          type: Engine.AttributeType.Uv,
          // prettier-ignore
          data: [
            0, 0,
            1, 0,
            1, 1,
            0, 1,
          ],
          stride: 2,
        },
      ],
      indices: [0, 1, 2, 0, 2, 3],
    });

    this.material = new Material({
      gpu,
      vertexShader,
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
