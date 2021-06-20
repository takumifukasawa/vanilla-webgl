import GPU from './libs/GPU.js';
import Material from './libs/Material.js';
import Geometry from './libs/Geomety.js';
import { Matrix4 } from './libs/Matrix.js';

const wrapperElement = document.querySelector('.js-wrapper');
const canvasElement = document.querySelector('.js-canvas');

const gpu = new GPU({
  canvasElement,
});

const states = {
  isResized: false,
};

(() => {
  // prettier-ignore
  // const m = new Matrix4(
  //   1, 0, 0, 0,
  //   0, 1, 0, 0,
  //   0, 0, 1, 0,
  //   2, 0, 0, 1
  // );
  // const m = Matrix4.getTranslateMatrix({ x: 1, y: 2, z: 3 });
  const m = Matrix4.getPerspectiveMatrix(
    // ( * Math.PI) / 360,
    // 0.5,
    // Math.PI * 0.5,
    0.5,
    window.innerWidth / window.innerHeight,
    0.1,
    10
  );
  const v = {
    x: 1,
    y: 1,
    z: -5,
    w: 1,
  };
  const p = Matrix4.multiplyVector4(m, v);
  console.log(p);
})();
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

    const loc = gl.getUniformLocation(
      this.material.getProgram(),
      'uProjectionMatrix'
    );
    const projectionMatrix = Matrix4.getPerspectiveMatrix(
      0.5,
      window.innerWidth / window.innerHeight,
      0.01,
      10
    );

    // const v = {
    //   x: 0.5,
    //   y: 0.5,
    //   z: 0.5,
    //   w: 1,
    // };
    // const p = Matrix4.multiplyVector4(projectionMatrix, v);
    // console.log(p);

    gl.uniformMatrix4fv(loc, false, projectionMatrix.elements);
    // gl.uniformMatrix4fv(
    //   loc,
    //   false,
    //   Matrix4.getTranslateMatrix({ x: 0.5, y: 0, z: 0 }).elements
    // );
    gpu.draw();
  }
}

const vertexShader = `#version 300 es

layout (location = 0) in vec3 aPosition;
layout (location = 1) in vec3 aColor;

out vec3 vColor;
out vec4 vPosition;

uniform mat4 uProjectionMatrix;

void main() {
  vColor = aColor;
  vec4 pos = uProjectionMatrix * vec4(aPosition, 1.);
  pos.z = 0.5;
  pos.w = 1.;
  // pos.z = 0.9;
  // pos.w = 4.;
  vPosition = pos;
  gl_Position = pos;
  // gl_Position = vec4(aPosition, 1.);
  // gl_Position = vec4(pos.xy, -1, 1);
}
`;

const fragmentShader = `#version 300 es
precision mediump float;
in vec3 vColor;
in vec4 vPosition;
out vec4 outColor;
void main() {
  outColor = vec4(vColor, 1);
  // float zw = vPosition.z / vPosition.w;
  // outColor = vec4(zw, 0., 0., 1.);
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
  uniforms: {
    type: 'Matrix4',
    data: [],
  },
  indices: [0, 2, 1, 1, 2, 3],
  primitiveType: GPU.Primitives.Triangle,
});

const material = new Material({
  gpu,
  vertexShader,
  fragmentShader,
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
