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
