import { Matrix4 } from './libs/matrices.js';
import {
  createShader,
  createVBO,
  createIBO,
  createProgram,
} from './libs/webgl-utils.js';

const canvas = document.querySelector('.js-canvas');
const wrapper = document.querySelector('.js-wrapper');

const vs = `
attribute vec3 a_position;
attribute vec4 a_color;

uniform mat4 u_modelMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;

varying vec4 v_color;

void main() {
  v_color = a_color;
  gl_Position = u_projectionMatrix * u_viewMatrix * u_modelMatrix * vec4(a_position, 1.);
}
`;

const fs = `
precision mediump float;

varying vec4 v_color;

void main() {
  gl_FragColor = v_color;
}
`;

function main() {
  const gl = canvas.getContext('webgl2');

  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vs);
  const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fs);

  const program = createProgram(gl, vertexShader, fragmentShader);

  // 0 ------- 1
  // |         |
  // |         |
  // |         |
  // 2 ------- 3

  const attributes = {
    position: {
      location: gl.getAttribLocation(program, 'a_position'),
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
      location: gl.getAttribLocation(program, 'a_color'),
      // prettier-ignore
      data: [
        1.0, 0.0, 0.0, 1.0, // red
        0.0, 1.0, 0.0, 1.0, // green
        0.0, 0.0, 1.0, 1.0, // blue
        1.0, 1.0, 1.0, 1.0, // white
      ],
      stride: 4,
    },
  };

  {
    const positionVBO = createVBO(gl, attributes.position.data);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionVBO);
    // enable attribute location
    gl.enableVertexAttribArray(attributes.position.location);
    // bind current array_buffer to attribute
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.vertexAttribPointer(
      attributes.position.location,
      attributes.position.stride,
      type,
      normalize,
      stride,
      offset
    );
  }

  {
    const colorVBO = createVBO(gl, attributes.color.data);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorVBO);
    // enable attribute location
    gl.enableVertexAttribArray(attributes.color.location);
    // bind current array_buffer to attribute
    const type = gl.FLOAT;
    const normalize = false;
    const stride = 0;
    const offset = 0;
    gl.vertexAttribPointer(
      attributes.color.location,
      attributes.color.stride,
      type,
      normalize,
      stride,
      offset
    );
  }

  const indices = [0, 2, 1, 1, 2, 3];

  const indicesIBO = createIBO(gl, indices);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesIBO);

  const uniformModelMatrixLocation = gl.getUniformLocation(
    program,
    'u_modelMatrix'
  );
  const uniformViewMatrixLocation = gl.getUniformLocation(
    program,
    'u_viewMatrix'
  );
  const uniformProjectionMatrixLocation = gl.getUniformLocation(
    program,
    'u_projectionMatrix'
  );

  const setSize = () => {
    const ratio = Math.min(window.devicePixelRatio, 1);
    const w = wrapper.offsetWidth * ratio;
    const h = wrapper.offsetHeight * ratio;
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
  };

  const tick = (now) => {
    const time = now / 1000;

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const modelMatrix = Matrix4.getRotationYMatrix(time);

    const viewMatrix = Matrix4.getLookAtMatrix([0, 0, 3], [0, 0, 0], [0, 1, 0]);

    const projectionMatrix = Matrix4.getPerspectiveMatrix(
      50,
      window.innerWidth / window.innerHeight,
      0.01,
      10
    );

    gl.uniformMatrix4fv(uniformModelMatrixLocation, false, modelMatrix);
    gl.uniformMatrix4fv(uniformViewMatrixLocation, false, viewMatrix);
    gl.uniformMatrix4fv(
      uniformProjectionMatrixLocation,
      false,
      projectionMatrix
    );

    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

    gl.flush();

    requestAnimationFrame(tick);
  };

  setSize();
  window.addEventListener('resize', setSize);

  requestAnimationFrame(tick);
}

main();
