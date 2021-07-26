import Actor from './Actor.js';
import Engine from './Engine.js';
import MeshComponent from './MeshComponent.js';

export default class MeshActor extends Actor {
  constructor(args = {}) {
    const { geometry, material } = args;
    super({
      ...args,
      type: Engine.ActorType.MeshActor,
    });
    this.geometry = geometry;
    this.material = material;
  }
}
