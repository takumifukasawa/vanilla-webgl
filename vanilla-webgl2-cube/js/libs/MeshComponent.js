import Component from './Component.js';
import GPU from './GPU.js';

export default class MeshComponent extends Component {
  constructor({ actor, geometry, material }) {
    super({
      actor,
      type: Component.Types.MeshComponent,
    });
    this.geometry = geometry;
    this.material = material;
  }
  update() {}
  render({ gpu, modelMatrix, viewMatrix, projectionMatrix }) {
    this.material.render({ modelMatrix, viewMatrix, projectionMatrix });
    gpu.setShader(this.material.shader);
    gpu.setAttributes(this.geometry.attributes);
    gpu.setIndices(this.geometry.indices);
    gpu.setUniforms(this.material.uniforms);
    gpu.draw(this.geometry.indices.data.length, GPU.Primitives.Triangle);
    gpu.resetData();
  }
}
