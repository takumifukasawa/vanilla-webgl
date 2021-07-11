import Actor from './Actor.js';

export default class MeshActor extends Actor {
  constructor({ meshComponent, name }) {
    super({ type: Actor.Types.MeshActor, name });
    this.meshComponent = meshComponent;
  }
}
