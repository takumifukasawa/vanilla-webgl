import Component from './Component.js';
import Engine from './Engine.js';

export default class MeshComponent extends Component {
  constructor({ geometry, material }) {
    super({
      type: Engine.ComponentType.MeshComponent,
    });
    this.geometry = geometry;
    this.material = material;
  }
}
