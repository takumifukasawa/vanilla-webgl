import GPU from './GPU.js';
import { Matrix4 } from './Matrix.js';

export default class Mesh {
  constructor({ geometry, material }) {
    this.geometry = geometry;
    this.material = material;
    this.worldTransform = Matrix4.identity();
    // TODO:
    // this.position;
    // this.rotation;
  }
  draw({ gpu, camera }) {
    const gl = gpu.getGl();

    const program = this.material.getProgram();

    gl.useProgram(program);

    gpu.setShader(this.material);

    // const primitives = [gl.POINTS, gl.LINES, gl.TRIANGLES];

    const attributeKeys = Object.keys(this.geometry.attributes);
    for (let i = 0; i < attributeKeys.length; i++) {
      const name = attributeKeys[i];
      const { buffer, stride } = this.geometry.attributes[name];
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer.getBuffer());
      const location = gl.getAttribLocation(program, name);
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, stride, gl.FLOAT, false, 0, 0);
    }

    if (this.material.uniforms) {
      // 特殊な扱いのmatrixは明示的にupdate
      const uniformModelMatrix = this.material.uniforms.find(
        (uniform) => uniform.type === GPU.UniformTypes.ModelMatrix
      );
      if (uniformModelMatrix) {
        uniformModelMatrix.data = this.worldTransform.getArray();
      }
      const uniformViewMatrix = this.material.uniforms.find(
        (uniform) => uniform.type === GPU.UniformTypes.ViewMatrix
      );
      if (uniformViewMatrix) {
        uniformViewMatrix.data = camera.worldTransform
          .getInvertMatrix()
          .getArray();
        // console.log(camera.worldTransform);
        // console.log(camera.worldTransform.getInvertMatrix().getArray());
      }
      const uniformProjectionMatrix = this.material.uniforms.find(
        (uniform) => uniform.type === GPU.UniformTypes.ProjectionMatrix
      );
      if (uniformProjectionMatrix) {
        uniformProjectionMatrix.data = camera.projectionMatrix.getArray();
      }
    }

    const uniformsKeys = Object.keys(this.material.uniforms);
    for (let i = 0; i < uniformsKeys; i++) {
      const name = uniformsKeys[i];
      const { type, data } = this.material.uniforms[name];
      const location = gl.getUniformLocation(program, name);
      // NOTE: add type
      switch (type) {
        case GPU.UniformTypes.Matrix4fv:
        case GPU.UniformTypes.ModelMatrix:
        case GPU.UniformTypes.ViewMatrix:
        case GPU.UniformTypes.ProjectionMatrix:
          gl.uniformMatrix4fv(location, false, data);
          break;
        default:
          throw 'no uniform type';
      }
    }

    // indices
    gl.bindBuffer(
      gl.ELEMENT_ARRAY_BUFFER,
      this.geometry.indices.buffer.getBuffer()
    );

    // // draw
    // gl.drawElements(
    //   primitives[geometry.primitiveType],
    //   geometry.indices.length,
    //   gl.UNSIGNED_SHORT,
    //   0
    // );
  }
}
