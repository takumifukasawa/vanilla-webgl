import Component from './Component.js';

export default class CameraComponent extends Component {
  #type;

  static Types = {
    Perspective: 'Perspective',
    Orthographic: 'Orthographic',
  };

  constructor({ type }) {
    super({
      type: Component.Types.CameraComponent,
    });
    this.#type = type;
  }
}
