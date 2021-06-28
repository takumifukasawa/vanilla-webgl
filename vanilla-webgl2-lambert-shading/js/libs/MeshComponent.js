import Component from './Component.js';

export default class MeshComponent extends Component {
  constructor({ actor, geometry, material }) {
    super({
      actor,
      type: Component.Types.MeshComponent,
    });
    this.geometry = geometry;
    this.material = material;
  }
}
