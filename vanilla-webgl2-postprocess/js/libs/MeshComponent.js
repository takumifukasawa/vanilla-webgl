import Component from './Component.js';

export default class MeshComponent extends Component {
  constructor({ geometry, material }) {
    super({
      type: Component.Types.MeshComponent,
    });
    this.geometry = geometry;
    this.material = material;
  }
}
