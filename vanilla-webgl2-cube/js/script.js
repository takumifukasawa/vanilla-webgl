import GPU from './libs/GPU.js';
import Material from './libs/Material.js';
import Geometry from './libs/Geometry.js';
import PerspectiveCamera from './libs/PerspectiveCamera.js';
// import { Matrix4 } from './libs/Matrix.js';

class Mesh {
  constructor({ geometry, material }) {
    this.geometry = geometry;
    this.material = material;
  }
  draw({ gpu }) {
    gpu.setGeometry(this.geometry);
    gpu.setMaterial(this.material);

    const gl = gpu.getGl();
    gl.enable(gl.DEPTH_TEST);

    // const loc = gl.getUniformLocation(
    //   this.material.getProgram(),
    //   'uProjectionMatrix'
    // );
    // const projectionMatrix = Matrix4.getPerspectiveMatrix(
    //   0.5,
    //   window.innerWidth / window.innerHeight,
    //   0.01,
    //   10
    // );

    // gl.uniformMatrix4fv(loc, false, projectionMatrix.elements);

    // TODO: 呼び出し側でやったほうがよさそう
    gpu.draw();
  }
}

const wrapperElement = document.querySelector('.js-wrapper');
const canvasElement = document.querySelector('.js-canvas');

const gpu = new GPU({
  canvasElement,
});

const states = {
  isResized: false,
};

const perspectiveCamera = new PerspectiveCamera(0.5, 1, 0.01, 10);

const vertexShader = `#version 300 es

layout (location = 0) in vec3 aPosition;
layout (location = 1) in vec3 aColor;

out vec3 vColor;

uniform mat4 uProjectionMatrix;

void main() {
  vColor = aColor;
  vec4 pos = uProjectionMatrix * vec4(aPosition, 1.);
  gl_Position = pos;
}
`;

const fragmentShader = `#version 300 es
precision mediump float;
in vec3 vColor;
out vec4 outColor;
void main() {
  outColor = vec4(vColor, 1);
}
`;

const geometry = new Geometry({
  gpu,
  attributes: {
    aPosition: {
      // prettier-ignore
      data: [
          -0.1, 0.1, -1, // left top
          0.1, 0.1, -1, // right top
          -0.1, -0.1, -1, // left bottom
          0.1, -0.1, -1, // right bottom
        ],
      stride: 3,
    },
    aColor: {
      // prettier-ignore
      data: [
          1, 0, 0,
          0, 1, 0,
          0, 0, 1,
          1, 1, 0,
        ],
      stride: 3,
    },
  },
  indices: [0, 2, 1, 1, 2, 3],
  primitiveType: GPU.Primitives.Triangle,
});

const material = new Material({
  gpu,
  vertexShader,
  fragmentShader,
  uniforms: {
    uProjectionMatrix: {
      type: 'ProjectionMatrix',
      data: [],
    },
  },
});

const plane = new Mesh({
  gpu,
  geometry,
  material,
});

const onWindowResize = () => {
  states.isResized = true;
};

const tick = (t) => {
  // current unused
  // const time = t / 1000;

  if (states.isResized) {
    const ratio = Math.max(window.devicePixelRatio, 0.5);
    const targetWidth = wrapperElement.offsetWidth / ratio;
    const targetHeight = wrapperElement.offsetHeight / ratio;
    canvasElement.width = targetWidth;
    canvasElement.height = targetHeight;
    gpu.setSize(targetWidth, targetHeight);
    perspectiveCamera.updateProjectionMatrix(targetWidth / targetHeight);
    states.isResized = false;
  }

  gpu.clear(0, 0, 0, 0);

  plane.draw({ gpu });

  requestAnimationFrame(tick);
};

const main = () => {
  gpu.setCamera(perspectiveCamera);
  onWindowResize();
  window.addEventListener('resize', () => {
    onWindowResize();
  });
  requestAnimationFrame(tick);
};

main();
