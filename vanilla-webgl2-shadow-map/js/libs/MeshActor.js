import Actor from './Actor.js';
import Engine from './Engine.js';

export default class MeshActor extends Actor {
  constructor(args = {}) {
    const { meshComponent, components = [] } = args;
    super({
      ...args,
      type: Engine.ActorType.MeshActor,
      components: [...components, meshComponent], // override
    });
    this.meshComponent = meshComponent;
  }
  getMaterial() {
    return this.meshComponent.material;
  }
}
