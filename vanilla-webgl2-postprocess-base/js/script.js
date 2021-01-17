import { createFrameBuffer, createFrameBufferMRT } from '/libs/webgl-utils.js';
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
attribute vec4 a_color;
attribute vec2 a_uv;

varying vec4 v_color;
varying vec2 v_uv;

void main() {
  v_color = a_color;
  v_uv = a_uv;
  gl_Position = vec4(a_position, 1.);
}
`;

const postprocessFragmentShaderText = `
precision mediump float;

uniform sampler2D u_sceneTexture;
uniform float u_time;

varying vec2 v_uv;

// cheap random
float random (vec2 st) {
  return fract(sin(dot(st.xy,
                       vec2(12.9898,78.233)))*
      43758.5453123);
}

void main() {
  vec4 texColor = texture2D(u_sceneTexture, v_uv);
  float noise = random(v_uv + mod(u_time, 1.));
  gl_FragColor = vec4(texColor.rgb + noise * .4, 1.);
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

  // prettier-ignore
  const planeIndices = [
    0, 2, 1,
    1, 2, 3
  ];

  const planePositionVBO = createVBO(gl, planeAttributes.position.data);
  const planeColorVBO = createVBO(gl, planeAttributes.color.data);
  const planeIndicesIBO = createIBO(gl, planeIndices);

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
    uv: {
      location: gl.getAttribLocation(postprocessProgram, 'a_uv'),
      // prettier-ignore
      data: [
        0.0, 1.0,
        1.0, 1.0,
        0.0, 0.0,
        1.0, 0.0,
      ],
      stride: 2,
    },
  };

  // prettier-ignore
  const postprocessIndices = [
    0, 2, 1,
    1, 2, 3
  ];

  const postprocessPositionVBO = createVBO(
    gl,
    postprocessAttributes.position.data
  );
  const postprocessUvVBO = createVBO(gl, postprocessAttributes.uv.data);

  const postprocessIndicesIBO = createIBO(gl, postprocessIndices);

  const sceneTextureUniformLocation = gl.getUniformLocation(
    postprocessProgram,
    'u_sceneTexture'
  );
  const postprocessTimeUniformLocation = gl.getUniformLocation(
    postprocessProgram,
    'u_time'
  );

  // ------------------------------------------------------------------------------
  // end postprocess geometry
  // ------------------------------------------------------------------------------

  let width = wrapper.offsetWidth;
  let height = wrapper.offsetHeight;

  // frame buffer for mrt
  const frameBuffers = createFrameBufferMRT(gl, width, height, 2);
  gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffers.frameBuffer);
  const bufferList = [gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1];
  gl.drawBuffers(bufferList);

  const renderTarget = createFrameBuffer(gl, width, height);

  const setSize = () => {
    const ratio = Math.min(window.devicePixelRatio, 1);
    width = wrapper.offsetWidth * ratio;
    height = wrapper.offsetHeight * ratio;
    canvas.width = width;
    canvas.height = height;

    renderTarget.setSize(width, height);

    gl.viewport(0, 0, width, height);
  };

  // ------------------------------------------------------------------------------
  // tick
  // ------------------------------------------------------------------------------

  const tick = (now) => {
    const time = now / 1000;

    // ---------------------------------------------------------------------------
    // setup: render to buffer
    // ---------------------------------------------------------------------------

    // render to frame buffer
    // gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffers.frameBuffer);
    gl.bindFramebuffer(gl.FRAMEBUFFER, renderTarget.frameBuffer);

    // clear
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // ---------------------------------------------------------------------------
    // plane model
    // ---------------------------------------------------------------------------

    gl.useProgram(planeProgram);

    {
      // plane position
      gl.bindBuffer(gl.ARRAY_BUFFER, planePositionVBO);
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
      // plane color
      gl.bindBuffer(gl.ARRAY_BUFFER, planeColorVBO);
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
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, planeIndicesIBO);

    {
      const modelMatrix = Matrix4.getRotationYMatrix(time);

      const viewMatrix = Matrix4.getLookAtMatrix(
        [0, 0, 3],
        [0, 0, 0],
        [0, 1, 0]
      );

      const projectionMatrix = Matrix4.getPerspectiveMatrix(
        50,
        width / height,
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
    }

    gl.drawElements(gl.TRIANGLES, planeIndices.length, gl.UNSIGNED_SHORT, 0);

    gl.flush();

    // ---------------------------------------------------------------------------
    // setup: render to screen
    // ---------------------------------------------------------------------------

    gl.bindFramebuffer(gl.FRAMEBUFFER, null);

    // clear
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // ---------------------------------------------------------------------------
    // postprocess model
    // ---------------------------------------------------------------------------

    {
      gl.useProgram(postprocessProgram);

      // postprocess position
      gl.bindBuffer(gl.ARRAY_BUFFER, postprocessPositionVBO);
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

    {
      // postprocess uv
      gl.bindBuffer(gl.ARRAY_BUFFER, postprocessUvVBO);
      // enable attribute location
      gl.enableVertexAttribArray(postprocessAttributes.uv.location);
      // bind current array_buffer to attribute
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.vertexAttribPointer(
        postprocessAttributes.uv.location,
        postprocessAttributes.uv.stride,
        type,
        normalize,
        stride,
        offset
      );
    }

    // postprocess indices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, postprocessIndicesIBO);

    gl.bindTexture(gl.TEXTURE_2D, renderTarget.texture);
    gl.uniform1i(sceneTextureUniformLocation, 0);

    gl.uniform1f(postprocessTimeUniformLocation, time);

    gl.drawElements(
      gl.TRIANGLES,
      postprocessIndices.length,
      gl.UNSIGNED_SHORT,
      0
    );

    gl.bindTexture(gl.TEXTURE_2D, null);

    gl.flush();

    // ---------------------------------------------------------------------------
    // tick
    // ---------------------------------------------------------------------------

    requestAnimationFrame(tick);
  };

  setSize();
  window.addEventListener('resize', setSize);

  requestAnimationFrame(tick);
}

main();
