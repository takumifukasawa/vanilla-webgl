import Engine from './Engine.js';
import Geometry from './Geometry.js';

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

export default class AbstractPostProcessPass {
  geometry;
  material;
  vertexShader = vertexShader;

  constructor({ gpu, geometry }) {
    this.geometry = geometry
      ? geometry
      : new Geometry({
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
  }

  setSize(width, height) {
    throw "should override 'setSize' method";
  }

  render({ renderer }) {
    throw "should override 'render' method";
  }
}
