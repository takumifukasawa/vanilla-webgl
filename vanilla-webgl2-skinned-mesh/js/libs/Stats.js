export default class Stats {
  static #instance;

  static get instance() {
    if (!Stats.#instance) {
      throw 'no instantiated';
    }
    return Stats.instance;
  }

  constructor() {}
}
