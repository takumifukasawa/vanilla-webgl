export default class Attribute {
  static Types = {
    Position: 'Position',
    Normal: 'Normal',
    Uv: 'UV',
    Tangent: 'Tangent',
    Binormal: 'Binormal',
  };
  constructor({ type, data, stride, location }) {
    this.type = type;
    this.data = data;
    this.stride = stride;
    this.location = location;
  }
}
