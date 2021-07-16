import Matrix4 from './Matrix4.js';
import Vector3 from './Vector3.js';
import Actor from './Actor.js';
import Component from './Component.js';

export default class CameraActor extends Actor {
  get camera() {
    const cameraComponent = this.components.find((component) => {
      return component.type === Component.Types.CameraComponent;
    });
    return cameraComponent ? cameraComponent.camera : null;
  }
  constructor(args = {}) {
    super(args);
  }
}
