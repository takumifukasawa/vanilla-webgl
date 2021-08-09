import Component from './Component.js';
import { ComponentType } from './Constants.js';

export default class MeshComponent extends Component {
  constructor({ geometry, material }) {
    super({
      type: ComponentType.MeshComponent,
    });
    this.geometry = geometry;
    this.material = material;
  }
}
