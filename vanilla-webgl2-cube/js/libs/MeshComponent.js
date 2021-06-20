import Component from './Component.js';

export default class MeshComponent extends Component {
  constructor({ actor, geometry, material }) {
    super({
      actor,
      type: Component.Types.MeshComponent,
    });
    this.geometry = geometry;
    this.material = material;
    // this.mesh = new Mesh({ geometry, material });
  }
  update() {}
  render({ gpu, modelMatrix, viewMatrix, projectionMatrix }) {
    const gl = gpu.getGl();
    this.geometry.render({ gpu, shader: this.material });
    this.material.render({ gpu, modelMatrix, viewMatrix, projectionMatrix });
    const primitives = [gl.POINTS, gl.LINES, gl.TRIANGLES];
    gpu
      .getGl()
      .drawElements(
        primitives[this.geometry.primitiveType],
        this.geometry.indices.length,
        gl.UNSIGNED_SHORT,
        0
      );
  }
}
