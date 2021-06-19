import GPU from './libs/GPU.js';
import Material from './libs/Material.js';
import PlaneGeometry from './libs/Geometry/PlaneGeometry.js';

const wrapperElement = document.querySelector('.js-wrapper');
const canvasElement = document.querySelector('.js-canvas');

const gpu = new GPU({
  canvasElement,
});

const states = {
  isResized: false,
};

class Plane {
  // vertices:
  // 0 --------- 1
  // |         / |
  // |       /   |
  // |     /     |
  // |   /       |
  // | /         |
  // 2 --------- 3
  constructor({ gpu, geometry, material }) {
    const gl = gpu.getGl();
    // this.indexBuffer = null;
    this.geometry = geometry;
    this.material = material;

    this.positionLocation = gl.getAttribLocation(
      this.material.getProgram(),
      'aPosition'
    );
    this.colorLocation = gl.getAttribLocation(
      this.material.getProgram(),
      'aColor'
    );
    // this.attributes = {
    //   position: {
    //     location: gl.getAttribLocation(this.material.getProgram(), 'aPosition'),
    //     data: vertices,
    //     stride: 3,
    //     buffer: new VertexBuffer({
    //       gl,
    //       data: vertices,
    //     }),
    //   },
    //   color: {
    //     // location: gl.getAttribLocation(this.material.getProgram(), 'aColor'),
    //     data: colors,
    //     stride: 3,
    //     buffer: new VertexBuffer({
    //       gl,
    //       data: colors,
    //     }),
    //   },
    // };
    // this.indices = [0, 2, 1, 1, 2, 3];
    // this.vertexCount = this.indices.length / 3;
    // this.indexBuffer = new IndexBuffer({ gl, data: this.indices });
  }
  draw({ gpu }) {
    const gl = gpu.getGl();
    // gpu.setVertexBuffer(this.geometry.vertexBuffer);
    gpu.setMaterial(this.material);
    // gpu.setVertexFormat(this.vertexFormat);
    const program = this.material.getProgram();
    // const program = this.material.getProgram();
    // TODO: bindからdrawelementsまでgpuでやる
    // positions
    gl.bindBuffer(
      gl.ARRAY_BUFFER,
      this.geometry.attributes.position.buffer.getBuffer()
    );
    gl.enableVertexAttribArray(this.geometry.attributes.position.location);
    gl.vertexAttribPointer(
      this.geometry.attributes.position.location,
      this.geometry.attributes.position.stride,
      gl.FLOAT,
      false,
      0,
      0
    );
    // colors
    gl.bindBuffer(
      gl.ARRAY_BUFFER,
      this.geometry.attributes.color.buffer.getBuffer()
    );
    gl.enableVertexAttribArray(this.geometry.attributes.color.location);
    gl.vertexAttribPointer(
      this.geometry.attributes.color.location,
      this.geometry.attributes.color.stride,
      gl.FLOAT,
      false,
      0,
      0
    );
    // indices
    gl.bindBuffer(
      gl.ELEMENT_ARRAY_BUFFER,
      this.geometry.indexBuffer.getBuffer()
    );
    // draw
    gl.drawElements(
      gl.TRIANGLES,
      // primitives[primitiveType],
      this.geometry.indices.length,
      gl.UNSIGNED_SHORT,
      0
    );
    // gpu.draw(this.vertexCount);
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
const plane = new Plane({
  gpu,
  material,
  geometry: new PlaneGeometry({
    program: material.getProgram(),
    gpu,
    // prettier-ignore
    vertices: [
      -0.5, 0.5, 0, // left top
      0.5, 0.5, 0, // right top
      -0.5, -0.5, 0, // left bottom
      0.5, -0.5, 0, // right bottom
    ],
    // prettier-ignore
    colors: [
      1, 0, 0,
      0, 1, 0,
      0, 0, 1,
      1, 1, 0,
    ],
  }),
});

const onWindowResize = () => {
  states.isResized = true;
};

const tick = (t) => {
  const time = t / 1000;

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
