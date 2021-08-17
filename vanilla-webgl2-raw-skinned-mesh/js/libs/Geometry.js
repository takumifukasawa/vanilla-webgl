import VertexArrayObject from './VertexArrayObject.js';
import { AttributeType } from './Constants.js';

export default class Geometry {
  constructor({ gpu, attributes, indices }) {
    const gl = gpu.gl;

    this.indices = indices;

    this.attributes = attributes.map((attribute, i) => {
      const location =
        attribute.location === undefined ? i : attribute.location;
      return {
        ...attribute,
        location,
      };
    });

    this.vao = new VertexArrayObject({
      gl,
      attributes: this.attributes,
      indices,
    });
  }

  get vertexCount() {
    const position = this.attributes.find(
      ({ type }) => type === AttributeType.Position,
    );
    return position ? position.data.length / 3 : 0;
  }
}
