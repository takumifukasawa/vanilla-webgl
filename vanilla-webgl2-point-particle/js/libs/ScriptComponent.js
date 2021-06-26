import Component from './Component.js';

export default class ScriptComponent extends Component {
  constructor({ updateFunc, renderFunc }) {
    super({ type: Component.Types.LifeCycleComponent });
    this.updateFunc = updateFunc;
    this.renderFunc = renderFunc;
  }
  update({ actor, time, deltaTime }) {
    if (this.updateFunc) {
      this.updateFunc({ actor, time, deltaTime });
    }
  }
}
