export default class Shader {
  constructor({ gpu, vertexShader, fragmentShader }) {
    const gl = gpu.getGl();
    this.program = null;
    const vs = gl.createShader(gl.VERTEX_SHADER);
    const fs = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vs, vertexShader);
    gl.compileShader(vs);
    const vsInfo = gl.getShaderInfoLog(vs);
    if (vsInfo.length > 0) {
      throw vsInfo;
    }

    gl.shaderSource(fs, fragmentShader);
    gl.compileShader(fs);
    const fsInfo = gl.getShaderInfoLog(fs);
    if (fsInfo.length > 0) {
      throw fsInfo;
    }

    this.program = gl.createProgram();

    gl.attachShader(this.program, vs);
    gl.attachShader(this.program, fs);
    gl.linkProgram(this.program);
    // gl.validateProgram(this.program);

    const programInfo = gl.getProgramInfoLog(this.program);
    if (programInfo.length > 0) {
      throw programInfo;
    }
  }
  getProgram() {
    return this.program;
  }
}
