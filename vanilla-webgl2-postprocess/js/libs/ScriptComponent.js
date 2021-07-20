import Component from './Component.js';
import Engine from './Engine.js';

export default class ScriptComponent extends Component {
  constructor({ startFunc, updateFunc, renderFunc }) {
    super({ type: Engine.ComponentType.ScriptComponent });
    this.startFunc = startFunc;
    this.updateFunc = updateFunc;
    this.renderFunc = renderFunc;
  }
  start({ actor, time, deltaTime }) {
    if (this.startFunc) {
      this.startFunc({ actor, time, deltaTime });
    }
  }
  update({ actor, time, deltaTime }) {
    if (this.updateFunc) {
      this.updateFunc({ actor, time, deltaTime });
    }
  }
  render({ actor, time, deltaTime }) {
    if (this.renderFunc) {
      this.renderFunc({ actor, time, deltaTime });
    }
  }
}
