export default class GUIDebugger {
  static #instance;
  #rootElement;

  static get instance() {
    if (!GUIDebugger.#instance) {
      throw 'no instantiated';
    }
    return GUIDebugger.#instance;
  }

  get rootElement() {
    return this.#rootElement;
  }

  constructor(rootElement = null) {
    if (GUIDebugger.#instance) {
      return GUIDebugger.#instance;
    }

    GUIDebugger.#instance = this;

    this.#rootElement = rootElement;
    if (rootElement) {
      this.#rootElement = rootElement;
    } else {
      const elem = document.createElement('div');
      document.body.appendChild(elem);
      elem.style.position = 'fixed';
      elem.style.top = '0';
      elem.style.right = '0';
      elem.style.color = 'white';
      elem.style.textAlign = 'right';
      elem.style.fontSize = '9px';
      this.#rootElement = elem;
    }
  }

  static addRange({
    name,
    min,
    max,
    step,
    initialValue,
    onInput = () => {},
    onChange = () => {},
  }) {
    const instance = GUIDebugger.instance;
    const currentValue = initialValue ?? min;

    const elem = document.createElement('div');
    const label = document.createElement('p');
    const input = document.createElement('input');

    label.style.margin = '0.5em 0';

    input.type = 'range';
    input.min = min;
    input.max = max;
    input.value = currentValue;
    input.step = step;

    const updateLabel = (value) => {
      label.textContent = `[${name}] min: ${min}, max: ${max}, value: ${value}`;
    };

    input.addEventListener('input', (e) => {
      const { value } = e.target;
      updateLabel(value);
      onInput(Number(value));
    });
    input.addEventListener('change', (e) => {
      const { value } = e.target;
      updateLabel(value);
      onChange(Number(value));
    });

    elem.appendChild(label);
    elem.appendChild(input);
    instance.rootElement.appendChild(elem);

    updateLabel(currentValue);
  }
}
