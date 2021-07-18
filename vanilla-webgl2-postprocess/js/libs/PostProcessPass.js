import GPU from './GPU.js';
import RenderTarget from './RenderTarget.js';
import Shader from './Shader.js';
import Geometry from './Geometry.js';
import Attribute from './Attribute.js';

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
  #renderTarget;

  get renderTarget() {
    return this.#renderTarget;
  }

  constructor({ gpu, fragmentShader, uniforms }) {
    this.#renderTarget = new RenderTarget({ gpu });

    this.uniforms = {
      ...(uniforms || {}),
      uSceneTexture: {
        type: GPU.UniformTypes.Texture2D,
        data: null,
      },
    };

    this.shader = new Shader({
      gpu,
      vertexShader,
      fragmentShader,
    });

    this.geometry = new Geometry({
      gpu,
      attributes: [
        {
          type: Attribute.Types.Position,
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
          type: Attribute.Types.Uv,
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
  }

  setSize(width, height) {
    this.#renderTarget.setSize(width, height);
  }

  update({ renderTarget }) {
    this.uniforms.uSceneTexture.data = renderTarget.texture;
  }
}
