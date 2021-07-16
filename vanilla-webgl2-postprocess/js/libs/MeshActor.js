import Actor from './Actor.js';

export default class MeshActor extends Actor {
  constructor({ name, meshComponent }) {
    super({ name, type: Actor.Types.MeshActor });
    this.meshComponent = meshComponent;
  }
}
