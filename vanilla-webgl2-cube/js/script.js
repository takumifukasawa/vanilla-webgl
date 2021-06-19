import GPU from './libs/GPU.js';
import Material from './libs/Material.js';
import Geometry from './libs/Geomety.js';

const wrapperElement = document.querySelector('.js-wrapper');
const canvasElement = document.querySelector('.js-canvas');

const gpu = new GPU({
  canvasElement,
});

const states = {
  isResized: false,
};

class Mesh {
  constructor({ geometry, material }) {
    this.geometry = geometry;
    this.material = material;
  }
  draw({ gpu }) {
    gpu.setGeometry(this.geometry);
    gpu.setMaterial(this.material);
    gpu.draw();
  }
}

const vertexShader = `#version 300 es

layout (location = 0) in vec3 aPosition;
layout (location = 1) in vec3 aColor;

out vec3 vColor;

void main() {
  vColor = aColor;
  gl_Position = vec4(aPosition, 1.);
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
const material = new Material({
  gpu,
  vertexShader,
  fragmentShader,
});
const plane = new Mesh({
  gpu,
  material,
  geometry: new Geometry({
    gpu,
    attributes: {
      position: {
        attributeName: 'aPosition',
        // prettier-ignore
        data: [
          -0.5, 0.5, 0, // left top
          0.5, 0.5, 0, // right top
          -0.5, -0.5, 0, // left bottom
          0.5, -0.5, 0, // right bottom
        ],
        stride: 3,
      },
      color: {
        attributeName: 'aColor',
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
  }),
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
    states.isResized = false;
  }

  gpu.clear(0, 0, 0, 0);

  plane.draw({ gpu });

  requestAnimationFrame(tick);
};

const main = () => {
  onWindowResize();
  window.addEventListener('resize', () => {
    onWindowResize();
  });
  requestAnimationFrame(tick);
};

main();
