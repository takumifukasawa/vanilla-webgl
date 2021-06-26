import Actor from './Actor.js';

export default class MeshActor extends Actor {
  constructor({ meshComponent }) {
    super({ type: Actor.Types.MeshActor });
    this.meshComponent = meshComponent;
  }
}
