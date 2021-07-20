import Actor from './Actor.js';
import Engine from './Engine.js';

export default class MeshActor extends Actor {
  constructor({ name, meshComponent }) {
    super({ name, type: Engine.ActorType.MeshActor });
    this.meshComponent = meshComponent;
  }
}
