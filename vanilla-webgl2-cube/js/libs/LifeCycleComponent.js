import Component from './Component.js';

export default class LifeCycleComponent extends Component {
  constructor({ actor, updateFunc, renderFunc }) {
    super({ actor, type: Component.Types.LifeCycleComponent });
    this.updateFunc = updateFunc;
    this.renderFunc = renderFunc;
  }
  update() {
    if (this.updateFunc) {
      this.updateFunc();
    }
  }
  render() {
    if (this.renderFunc) {
      this.renderFunc();
    }
  }
}
