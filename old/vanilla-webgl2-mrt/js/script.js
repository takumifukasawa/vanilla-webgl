import { createFrameBufferMRT } from './libs/webgl-utils.js';
import { Matrix4 } from './libs/matrices.js';
import {
  createShader,
  createVBO,
  createIBO,
  createProgram,
} from './libs/webgl-utils.js';

const canvas = document.querySelector('.js-canvas');
const wrapper = document.querySelector('.js-wrapper');

const cubeVertexShaderText = `#version 300 es

layout (location = 0) in vec3 a_position;
layout (location = 1) in vec3 a_normal;
layout (location = 2) in vec4 a_color;

uniform mat4 u_modelMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;

out vec3 v_normal;
out vec4 v_color;

void main() {
  v_color = a_color;
  mat4 normalMatrix = transpose(inverse(u_viewMatrix * u_modelMatrix));
  v_normal = (normalMatrix * vec4(a_normal, 1.)).xyz;
  gl_Position = u_projectionMatrix * u_viewMatrix * u_modelMatrix * vec4(a_position, 1.);
}
`;

const cubeFragmentShaderText = `#version 300 es
precision mediump float;

in vec3 v_normal;
in vec4 v_color;

layout (location = 0) out vec4 outColor0;
layout (location = 1) out vec4 outColor1;

void main() {
  outColor0 = v_color;
  outColor1 = vec4(v_normal, 1.);
}
`;

const postprocessVertexShaderText = `#version 300 es

layout (location = 0) in vec3 a_position;
layout (location = 1) in vec2 a_uv;

out vec2 v_uv;

void main() {
  v_uv = a_uv;
  gl_Position = vec4(a_position, 1.);
}
`;

const postprocessFragmentShaderText = `#version 300 es

precision highp float;

uniform sampler2D u_sceneTexture;
uniform float u_time;

in vec2 v_uv;

out vec4 outColor;

void main() {
  vec4 texColor = texture(u_sceneTexture, v_uv);
  outColor = vec4(texColor.rgb, 1.);
}
`;

function main() {
  const gl = canvas.getContext('webgl2');

  // ------------------------------------------------------------------------------
  // cube
  // ------------------------------------------------------------------------------

  const cubeVertexShader = createShader(
    gl,
    gl.VERTEX_SHADER,
    cubeVertexShaderText
  );
  const cubeFragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    cubeFragmentShaderText
  );

  const cubeProgram = createProgram(gl, cubeVertexShader, cubeFragmentShader);

  gl.useProgram(cubeProgram);

  //
  // vertex positions
  //
  //      4----------5
  //    / |        / |
  //  /   |      /   |
  // 0 ------- 1     |
  // |    6----|-----7
  // |   /     |   /
  // | /       | /
  // 2 ------- 3

  // vertices: 24
  const cubeAttributes = {
    position: {
      location: gl.getAttribLocation(cubeProgram, 'a_position'),
      // prettier-ignore
      data: [
        // front: 0,1,2,3
        -0.5, 0.5, 0.5,
        0.5, 0.5, 0.5,
        -0.5, -0.5, 0.5,
        0.5, -0.5, 0.5,
        //  back: 5,4,7,6
        0.5, 0.5, -0.5,
        -0.5, 0.5, -0.5,
        0.5, -0.5, -0.5,
        -0.5, -0.5, -0.5,
        // left: 4,0,6,2
        -0.5, 0.5, -0.5,
        -0.5, 0.5, 0.5,
        -0.5, -0.5, -0.5,
        -0.5, -0.5, 0.5,
        // right: 1,5,3,7
        0.5, 0.5, 0.5,
        0.5, 0.5, -0.5,
        0.5, -0.5, 0.5,
        0.5, -0.5, -0.5,
        // top: 4,5,0,1
        -0.5, 0.5, -0.5,
        0.5, 0.5, -0.5,
        -0.5, 0.5, 0.5,
        0.5, 0.5, 0.5,
        // bottom: 2,3,6,7
        -0.5, -0.5, 0.5,
        0.5, -0.5, 0.5,
        -0.5, -0.5, -0.5,
        0.5, -0.5, -0.5,
      ],
      stride: 3,
    },
    normal: {
      location: gl.getAttribLocation(cubeProgram, 'a_normal'),
      // prettier-ignore
      data: [
        0.0, 0.0, 1.0, // front
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, -1.0, // back
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        -1.0, 0.0, 0.0, // left
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
        1.0, 0.0, 0.0, // right
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        0.0, 1.0, 0.0, // top
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, -1.0, 0.0, // bottom
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
      ],
      stride: 3,
    },
    color: {
      location: gl.getAttribLocation(cubeProgram, 'a_color'),
      // prettier-ignore
      data: [
        1.0, 0.0, 0.0, 1.0, // red
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0, // red
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0, // red
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0, // red
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0, // red
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0, // red
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
        1.0, 0.0, 0.0, 1.0,
      ],
      stride: 4,
    },
  };

  const cubeIndices = [];
  for (let i = 0; i < 6; i++) {
    const offset = i * 4;
    cubeIndices.push(
      // prettier-ignore
      ...[
        0 + offset, 2 + offset, 1 + offset,
        1 + offset, 2 + offset, 3 + offset,
      ]
    );
  }

  const cubePositionVBO = createVBO(gl, cubeAttributes.position.data);
  const cubeNormalVBO = createVBO(gl, cubeAttributes.normal.data);
  const cubeColorVBO = createVBO(gl, cubeAttributes.color.data);
  const cubeIndicesIBO = createIBO(gl, cubeIndices);

  const uniformModelMatrixLocation = gl.getUniformLocation(
    cubeProgram,
    'u_modelMatrix'
  );
  const uniformViewMatrixLocation = gl.getUniformLocation(
    cubeProgram,
    'u_viewMatrix'
  );
  const uniformProjectionMatrixLocation = gl.getUniformLocation(
    cubeProgram,
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

  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.enable(gl.CULL_FACE);

  // frame buffer for mrt
  const frameBuffers = createFrameBufferMRT(gl, width, height, 2);
  gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffers.frameBuffer);
  const bufferList = [gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1];
  gl.drawBuffers(bufferList);

  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, frameBuffers.textures[0]);
  gl.activeTexture(gl.TEXTURE1);
  gl.bindTexture(gl.TEXTURE_2D, frameBuffers.textures[1]);

  const setSize = () => {
    const ratio = Math.min(window.devicePixelRatio, 1);
    width = wrapper.offsetWidth * ratio;
    height = wrapper.offsetHeight * ratio;
    canvas.width = width;
    canvas.height = height;

    // frame buffers resize ??
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
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffers.frameBuffer);

    // clear
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // ---------------------------------------------------------------------------
    // cube model
    // ---------------------------------------------------------------------------

    gl.enable(gl.CULL_FACE);
    gl.enable(gl.DEPTH_TEST);
    // gl.enable(gl.SCISSOR_TEST);
    gl.depthFunc(gl.LEQUAL);

    gl.useProgram(cubeProgram);

    {
      // cube position
      gl.bindBuffer(gl.ARRAY_BUFFER, cubePositionVBO);
      // enable attribute location
      gl.enableVertexAttribArray(cubeAttributes.position.location);
      // bind current array_buffer to attribute
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.vertexAttribPointer(
        cubeAttributes.position.location,
        cubeAttributes.position.stride,
        type,
        normalize,
        stride,
        offset
      );
    }

    {
      // cube normal
      gl.bindBuffer(gl.ARRAY_BUFFER, cubeNormalVBO);
      // enable attribute location
      gl.enableVertexAttribArray(cubeAttributes.normal.location);
      // bind current array_buffer to attribute
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.vertexAttribPointer(
        cubeAttributes.normal.location,
        cubeAttributes.normal.stride,
        type,
        normalize,
        stride,
        offset
      );
    }

    {
      // cube color
      gl.bindBuffer(gl.ARRAY_BUFFER, cubeColorVBO);
      // enable attribute location
      gl.enableVertexAttribArray(cubeAttributes.color.location);
      // bind current array_buffer to attribute
      const type = gl.FLOAT;
      const normalize = false;
      const stride = 0;
      const offset = 0;
      gl.vertexAttribPointer(
        cubeAttributes.color.location,
        cubeAttributes.color.stride,
        type,
        normalize,
        stride,
        offset
      );
    }

    // cube indices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndicesIBO);

    {
      const modelMatrix = Matrix4.multiplyMatrices(
        Matrix4.getRotationXMatrix(time * 0.1),
        Matrix4.getRotationYMatrix(time * 0.15),
        Matrix4.getRotationZMatrix(time * 0.2)
      );

      const viewMatrix = Matrix4.getLookAtMatrix(
        [Math.cos(time) * 3, 1, Math.sin(time) * 3],
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

    gl.viewport(0, 0, width, height);

    gl.drawElements(gl.TRIANGLES, cubeIndices.length, gl.UNSIGNED_SHORT, 0);

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

    gl.uniform1f(postprocessTimeUniformLocation, time);

    const viewWidth = width / 2;
    const viewHeight = (width / 2) * (height / width);
    const viewTop = (height - viewHeight) * 0.5;

    // left

    gl.uniform1i(sceneTextureUniformLocation, 0);

    gl.viewport(0, viewTop, viewWidth, viewHeight);

    gl.drawElements(
      gl.TRIANGLES,
      postprocessIndices.length,
      gl.UNSIGNED_SHORT,
      0
    );

    // right

    gl.uniform1i(sceneTextureUniformLocation, 1);

    gl.viewport(viewWidth, viewTop, viewWidth, viewHeight);

    gl.drawElements(
      gl.TRIANGLES,
      postprocessIndices.length,
      gl.UNSIGNED_SHORT,
      0
    );

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
