export function createShader(gl, type, source) {
  // create shader
  const shader = gl.createShader(type);
  // upload shader source to gpu
  gl.shaderSource(shader, source);
  // compile shader
  gl.compileShader(shader);

  // check succeeded
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    return shader;
  }

  console.error(gl.getShaderInfoLog(shader));

  // delete shader
  gl.deleteShader(shader);
}

export function createProgram(gl, vertexShader, fragmentShader) {
  // create program
  const program = gl.createProgram();
  // attach vertex shader to program
  gl.attachShader(program, vertexShader);
  // attach fragment shader to program
  gl.attachShader(program, fragmentShader);
  // link program
  gl.linkProgram(program);

  // check succeeded
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.useProgram(program);
    return program;
  }

  console.error(gl.getProgramInfoLog(program));

  // delete program
  gl.deleteProgram(program);
}

export function createVBO(gl, data) {
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

export function createIBO(gl, data) {
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

export function createFrameBuffer(gl, initialWidth, initialHeight) {
  // create frame buffer
  const frameBuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);

  // create color buffer
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.framebufferTexture2D(
    gl.FRAMEBUFFER,
    gl.COLOR_ATTACHMENT0,
    gl.TEXTURE_2D,
    texture,
    0
  );
  gl.bindTexture(gl.TEXTURE_2D, null);

  // create depth buffer
  const depthRenderBuffer = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, depthRenderBuffer);
  gl.framebufferRenderbuffer(
    gl.FRAMEBUFFER,
    gl.DEPTH_ATTACHMENT,
    gl.RENDERBUFFER,
    depthRenderBuffer
  );
  gl.bindRenderbuffer(gl.RENDERBUFFER, null);

  const setSize = (width, height) => {
    // resize color buffer
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      width,
      height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );
    gl.bindTexture(gl.TEXTURE_2D, null);

    // resize depth buffer
    gl.bindRenderbuffer(gl.RENDERBUFFER, depthRenderBuffer);
    gl.renderbufferStorage(
      gl.RENDERBUFFER,
      gl.DEPTH_COMPONENT16,
      width,
      height
    );
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
  };

  setSize(initialWidth, initialHeight);

  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  return {
    frameBuffer,
    renderBuffer: depthRenderBuffer,
    texture,
    setSize,
  };
}

export function createFrameBufferMRT(gl, width, height, num) {
  const frameBuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);

  const textures = [];
  for (let i = 0; i < num; i++) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    textures[i] = texture;
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      width,
      height,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      null
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.framebufferTexture2D(
      gl.FRAMEBUFFER,
      gl.COLOR_ATTACHMENT0 + i,
      gl.TEXTURE_2D,
      texture,
      0
    );
  }

  // depth
  const depthRenderBuffer = gl.createRenderbuffer();
  gl.bindRenderbuffer(gl.RENDERBUFFER, depthRenderBuffer);
  gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
  gl.framebufferRenderbuffer(
    gl.FRAMEBUFFER,
    gl.DEPTH_ATTACHMENT,
    gl.RENDERBUFFER,
    depthRenderBuffer
  );

  // unbind
  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.bindRenderbuffer(gl.RENDERBUFFER, null);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  return {
    frameBuffer,
    renderBuffer: depthRenderBuffer,
    textures,
  };
}
