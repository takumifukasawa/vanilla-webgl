
import { Matrix4 } from "/libs/matrices.js";

const canvas = document.querySelector(".js-canvas");
const wrapper = document.querySelector(".js-wrapper");

const vs = `
attribute vec3 a_position;
attribute vec4 a_color;

uniform mat4 u_mvpMatrix;

varying vec4 v_color;

void main() {
  v_color = a_color;
  gl_Position = u_mvpMatrix * vec4(a_position, 1.);
}
`;

const fs = `
precision mediump float;

varying vec4 v_color;

void main() {
  gl_FragColor = v_color;
}
`;

function createShader(gl, type, source) {
  // create shader
  const shader = gl.createShader(type);
  // upload shader source to gpu
  gl.shaderSource(shader, source);
  // compile shader
  gl.compileShader(shader);

  // check succeeded
  if(gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    return shader;
  }

  console.error(gl.getShaderInfoLog(shader));

  // delete shader
  gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
  // create program
  const program = gl.createProgram();
  // attach vertex shader to program
  gl.attachShader(program, vertexShader);
  // attach fragment shader to program
  gl.attachShader(program, fragmentShader);
  // link program
  gl.linkProgram(program);

  // check succeeded
  if(gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.useProgram(program);
    return program;
  }

  console.error(gl.getProgramInfoLog(program));

  // delete program
  gl.deleteProgram(program);
}

function createVBO(gl, data) {
  // create buffer
  const vbo = gl.createBuffer();
  // bind buffer
  gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
  // set data to buffer
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
  // unbuffer
  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return vbo;
}

function createIBO(gl, data) {
  // create buffer
  const ibo = gl.createBuffer();
  // bind buffer
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
  // set data to buffer
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);
  // unbuffer
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

  return ibo;
}

function main() {
  const gl = canvas.getContext("webgl2");

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
      location: gl.getAttribLocation(program, "a_position"),
      data: [
        -0.5,  0.5,  0,
        0.5,  0.5,  0,
        -0.5, -0.5, 0,
        0.5, -0.5, 0,
      ],
      stride: 3,
    },
    color: {
      location: gl.getAttribLocation(program, "a_color"),
      data: [
        1.0,  0.0,  0.0,  1.0,
        0.0,  1.0,  0.0,  1.0,
        0.0,  0.0,  1.0,  1.0,
        1.0,  1.0,  1.0,  1.0,
      ],
      stride: 4
    }
  }

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

  const indices = [
    0, 2, 1,
    1, 2, 3
  ];

  const indicesIBO = createIBO(gl, indices);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indicesIBO);

  const uniformMvpMatrixLocation = gl.getUniformLocation(program, "u_mvpMatrix")

  const setSize = () => {
    const ratio = Math.min(window.devicePixelRatio, 1);
    const w = wrapper.offsetWidth * ratio;
    const h = wrapper.offsetHeight * ratio;
    canvas.width = w;
    canvas.height = h;
    gl.viewport(0, 0, w, h);
  }

  const tick = () => {
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const modelMatrix = Matrix4.getRotationYMatrix(performance.now() / 1000);

    const viewMatrix = Matrix4.getLookAtMatrix([0, 0, -1.4], [0, 0, 0], [0, 1, 0]);

    const projectionMatrix = Matrix4.getPerspectiveMatrix(50, window.innerWidth / window.innerHeight, 0.01, 10);

    // const mvpMatrix = Matrix4.multiplyMatrices(projectionMatrix, viewMatrix, modelMatrix);
    const mvpMatrix = Matrix4.multiplyMatrices(projectionMatrix, viewMatrix, modelMatrix);

    gl.uniformMatrix4fv(uniformMvpMatrixLocation, false, mvpMatrix);

    gl.drawElements(gl.TRIANGLES, indices.length, gl.UNSIGNED_SHORT, 0);

    gl.flush();

    requestAnimationFrame(tick);
  }

  setSize();
  window.addEventListener("resize", setSize);

  requestAnimationFrame(tick);
}

main();