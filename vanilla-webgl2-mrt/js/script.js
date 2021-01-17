import {
  createFrameBuffer,
  createFrameBufferMRT,
} from '../../libs/webgl-utils.js';
import { Matrix4 } from '/libs/matrices.js';
import {
  createShader,
  createVBO,
  createIBO,
  createProgram,
} from '/libs/webgl-utils.js';

const canvas = document.querySelector('.js-canvas');
const wrapper = document.querySelector('.js-wrapper');

const planeVertexShaderText = `
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

const planeFragmentShaderText = `
precision mediump float;

varying vec4 v_color;

void main() {
  gl_FragColor = v_color;
}
`;

const postprocessVertexShaderText = `
attribute vec3 a_position;
void main() {
  gl_Position = vec4(a_position, 1.);
}
`;

const postprocessFragmentShaderText = `
void main() {
  gl_FragColor = vec4(1., 0., 0., 1.);
}
`;

function main() {
  const gl = canvas.getContext('webgl2');

  // ------------------------------------------------------------------------------
  // plane
  // ------------------------------------------------------------------------------

  const planeVertexShader = createShader(
    gl,
    gl.VERTEX_SHADER,
    planeVertexShaderText
  );
  const planeFragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    planeFragmentShaderText
  );

  const planeProgram = createProgram(
    gl,
    planeVertexShader,
    planeFragmentShader
  );

  gl.useProgram(planeProgram);

  // 0 ------- 1
  // |         |
  // |         |
  // |         |
  // 2 ------- 3

  const planeAttributes = {
    position: {
      location: gl.getAttribLocation(planeProgram, 'a_position'),
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
      location: gl.getAttribLocation(planeProgram, 'a_color'),
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

  const planeIndices = [0, 2, 1, 1, 2, 3];

  const uniformModelMatrixLocation = gl.getUniformLocation(
    planeProgram,
    'u_modelMatrix'
  );
  const uniformViewMatrixLocation = gl.getUniformLocation(
    planeProgram,
    'u_viewMatrix'
  );
  const uniformProjectionMatrixLocation = gl.getUniformLocation(
    planeProgram,
    'u_projectionMatrix'
  );

  // ------------------------------------------------------------------------------
  // postprocess geometry
  // ------------------------------------------------------------------------------

  const postprocessVertexShader = createShader(
    gl,
    gl.VERTEX_SHADER,
    postprocessVertexShaderText
  );
  const postprocessFragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    postprocessFragmentShaderText
  );

  const postprocessProgram = createProgram(
    gl,
    postprocessVertexShader,
    postprocessFragmentShader
  );

  gl.useProgram(postprocessProgram);

  const postprocessAttributes = {
    position: {
      location: gl.getAttribLocation(postprocessProgram, 'a_position'),
      // prettier-ignore
      data: [
        -1, 1, 0, // left top
        1, 1, 0, // right top
        -1, -1, 0, // left bottom
        1, -1, 0, // right bottom
      ],
      stride: 3,
    },
    color: {
      location: gl.getAttribLocation(postprocessProgram, 'a_color'),
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

  const postprocessIndices = [0, 2, 1, 1, 2, 3];

  // ------------------------------------------------------------------------------
  // end postprocess geometry
  // ------------------------------------------------------------------------------

  const width = wrapper.offsetWidth;
  const height = wrapper.offsetHeight;

  // frame buffer for mrt
  const frameBuffers = createFrameBufferMRT(gl, width, height, 2);
  // gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffers.frameBuffer);
  // const bufferList = [gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1];
  // gl.drawBuffers(bufferList);

  const renderTarget = createFrameBuffer(gl, width, height);

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

    // render to frame buffer
    // gl.bindFrameBuffer(gl.FRAMEBUFFER, frameBuffers.frameBuffer);

    // clear
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // ---------------------------------------------------------------------------
    // plane model
    // ---------------------------------------------------------------------------

    gl.useProgram(planeProgram);

    {
      const positionVBO = createVBO(gl, planeAttributes.position.data);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionVBO);
      // enable attribute location
      gl.enableVertexAttribArray(planeAttributes.position.location);
      // bind current array_buffer to attribute
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.vertexAttribPointer(
        planeAttributes.position.location,
        planeAttributes.position.stride,
        type,
        normalize,
        stride,
        offset
      );
    }

    {
      const colorVBO = createVBO(gl, planeAttributes.color.data);
      gl.bindBuffer(gl.ARRAY_BUFFER, colorVBO);
      // enable attribute location
      gl.enableVertexAttribArray(planeAttributes.color.location);
      // bind current array_buffer to attribute
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.vertexAttribPointer(
        planeAttributes.color.location,
        planeAttributes.color.stride,
        type,
        normalize,
        stride,
        offset
      );
    }

    // plane indices
    {
      const planeIndicesIBO = createIBO(gl, planeIndices);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, planeIndicesIBO);
    }

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

    gl.drawElements(gl.TRIANGLES, planeIndices.length, gl.UNSIGNED_SHORT, 0);

    gl.flush();

    // ---------------------------------------------------------------------------
    // postprocess model
    // ---------------------------------------------------------------------------

    {
      const positionVBO = createVBO(gl, postprocessAttributes.position.data);
      gl.bindBuffer(gl.ARRAY_BUFFER, positionVBO);
      // enable attribute location
      gl.enableVertexAttribArray(postprocessAttributes.position.location);
      // bind current array_buffer to attribute
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.vertexAttribPointer(
        postprocessAttributes.position.location,
        postprocessAttributes.position.stride,
        type,
        normalize,
        stride,
        offset
      );
    }

    // postprocess indices
    {
      const postprocessIndicesIBO = createIBO(gl, postprocessIndices);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, postprocessIndicesIBO);
    }

    // -------

    requestAnimationFrame(tick);
  };

  setSize();
  window.addEventListener('resize', setSize);

  requestAnimationFrame(tick);
}

main();
