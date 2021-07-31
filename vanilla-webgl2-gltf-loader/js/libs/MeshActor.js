import Actor from './Actor.js';
import { ActorType } from './Constants.js';

export default class MeshActor extends Actor {
  constructor(args = {}) {
    const { geometry, material } = args;
    super({
      ...args,
      type: ActorType.MeshActor,
    });
    this.geometry = geometry;
    this.material = material;
  }
}
