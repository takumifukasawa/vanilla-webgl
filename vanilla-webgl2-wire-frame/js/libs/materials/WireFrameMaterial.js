import GPU from '../GPU.js';
import Material from './Material.js';

// const vertexShader = `#version 300 es
//
// layout (location = 0) in vec3 aPosition;
//
// uniform mat4 uModelMatrix;
// uniform mat4 uViewMatrix;
// uniform mat4 uProjectionMatrix;
//
// void main() {
//   gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.);
// }
// `;
//
// const fragmentShader = `#version 300 es
// precision mediump float;
//
// out vec4 outColor;
// void main() {
//   outColor = vec4(1, 0, 0, 1);
// }
// `;

const vertexShader = `#version 300 es

layout (location = 0) in vec3 aPosition;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

void main() {
  vec4 pos = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.);
  gl_Position = pos;
}
`;

const fragmentShader = `#version 300 es
precision mediump float;

out vec4 outColor;

void main() {
  outColor = vec4(1, 0, 0, 1);
}
`;

export default class WireFrameMaterial extends Material {
  constructor(args) {
    super({
      ...args,
      vertexShader,
      fragmentShader,
      primitiveType: GPU.Primitives.Triangle,
    });
  }
}
