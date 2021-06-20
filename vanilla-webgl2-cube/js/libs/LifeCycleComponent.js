import Component from './Component.js';

export default class LifeCycleComponent extends Component {
  constructor({ actor, updateFunc, renderFunc }) {
    super({ actor, type: Component.Types.LifeCycleComponent });
    this.updateFunc = updateFunc || (() => {});
    this.renderFunc = renderFunc || (() => {});
  }
  update() {
    this.updateFunc({ actor: this.actor });
  }
  render() {
    this.renderFunc({ actor: this.actor });
  }
}
