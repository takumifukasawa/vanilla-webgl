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
  render({ gpu }) {
    this.geometry.render();
    this.material.render({ gpu });
    const gl = this.gl;
    const { geometry, material } = mesh;
    const program = material.getProgram();

    // for (let i = 0; i < geometry.attributes.length; i++) {
    //   const { name, buffer, stride } = geometry.attributes[i];
    //   gl.bindBuffer(gl.ARRAY_BUFFER, buffer.getBuffer());
    //   const location = gl.getAttribLocation(program, name);
    //   gl.enableVertexAttribArray(location);
    //   gl.vertexAttribPointer(location, stride, gl.FLOAT, false, 0, 0);
    // }

    // TODO: geometry, material の処理は mesh 側でやるべき

    if (material.uniforms) {
      // 特殊な扱いのmatrixは明示的にupdate
      const uniformModelMatrix = material.uniforms.find(
        (uniform) => uniform.type === GPU.UniformTypes.ModelMatrix
      );
      if (uniformModelMatrix) {
        uniformModelMatrix.data = mesh.worldTransform.getArray();
      }
      const uniformViewMatrix = material.uniforms.find(
        (uniform) => uniform.type === GPU.UniformTypes.ViewMatrix
      );
      if (uniformViewMatrix) {
        uniformViewMatrix.data = camera.worldTransform
          .getInvertMatrix()
          .getArray();
        // console.log(camera.worldTransform);
        // console.log(camera.worldTransform.getInvertMatrix().getArray());
      }
      const uniformProjectionMatrix = material.uniforms.find(
        (uniform) => uniform.type === GPU.UniformTypes.ProjectionMatrix
      );
      if (uniformProjectionMatrix) {
        uniformProjectionMatrix.data = camera.projectionMatrix.getArray();
      }
    }

    for (let i = 0; i < material.uniforms.length; i++) {
      const { name, type, data } = material.uniforms[i];
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
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, geometry.indexBuffer.getBuffer());
  }
}
