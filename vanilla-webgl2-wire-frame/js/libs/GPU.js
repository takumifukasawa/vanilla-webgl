import Texture from './Texture.js';

const createWhite1x1 = () => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = 1;
  canvas.height = 1;
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, 1, 1);
  return canvas;
};

export default class GPU {
  static Primitives = {
    Points: 0,
    Lines: 1,
    Triangles: 2,
  };
  static UniformTypes = {
    Matrix4fv: 0,
    Texture2D: 1,
  };
  constructor({ canvasElement }) {
    this.gl = canvasElement.getContext('webgl2');
    this.shader = null;
    this.attributes = null;
    this.uniforms = null;
    this.indices = null;
    this.dummyTexture = new Texture({ gpu: this, img: createWhite1x1() });
  }
  setShader(shader) {
    this.shader = shader;
  }
  setAttributes(attributes) {
    this.attributes = attributes;
  }
  setIndices(indices) {
    this.indices = indices;
  }
  setUniforms(uniforms) {
    this.uniforms = uniforms;
  }
  setTextures() {}
  resetData() {
    this.shader = null;
    this.attributes = null;
    this.uniforms = null;
    this.indices = null;
  }
  setSize(width, height) {
    this.gl.viewport(0, 0, width, height);
  }
  clear(r, g, b, a) {
    const gl = this.gl;
    gl.clearColor(r, g, b, a);
    gl.clearDepth(1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.flush();
    const e = gl.getError();
    if (e !== gl.NO_ERROR) {
      throw 'has gl error.';
    }
  }
  getGl() {
    return this.gl;
  }
  draw(vertexCount, primitiveType, startVertexOffset = 0) {
    const gl = this.gl;
    const program = this.shader.getProgram();

    gl.useProgram(program);

    const primitives = {
      [GPU.Primitives.Points]: gl.POINTS,
      [GPU.Primitives.Lines]: gl.LINES,
      [GPU.Primitives.Triangles]: gl.TRIANGLES,
    };

    const attributeKeys = Object.keys(this.attributes);
    for (let i = 0; i < attributeKeys.length; i++) {
      const name = attributeKeys[i];
      const { buffer, stride } = this.attributes[name];
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer.getBuffer());
      const location = gl.getAttribLocation(program, name);
      gl.enableVertexAttribArray(location);
      gl.vertexAttribPointer(location, stride, gl.FLOAT, false, 0, 0);
    }

    // indices
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indices.buffer.getBuffer());

    // init textures
    let activeTextureIndex = 0;
    // NOTE:
    // - glから最大テクスチャ割当可能数を取得して動的に設定してもよい
    // - 連番なので列挙しなくてもよい
    const textureUnits = [
      gl.TEXTURE0,
      gl.TEXTURE1,
      gl.TEXTURE2,
      gl.TEXTURE3,
      gl.TEXTURE4,
      gl.TEXTURE5,
      gl.TEXTURE6,
      gl.TEXTURE7,
    ];

    // uniforms
    const uniformsKeys = Object.keys(this.uniforms);
    for (let i = 0; i < uniformsKeys.length; i++) {
      const name = uniformsKeys[i];
      const { type, data } = this.uniforms[name];
      const location = gl.getUniformLocation(program, name);
      // NOTE: add type
      switch (type) {
        case GPU.UniformTypes.Matrix4fv:
          gl.uniformMatrix4fv(location, false, data);
          break;
        case GPU.UniformTypes.Texture2D:
          // TODO: textureが最大数よりも大きくなるときの対応が必要
          gl.activeTexture(textureUnits[activeTextureIndex]);
          gl.bindTexture(
            gl.TEXTURE_2D,
            data ? data.getTexture() : this.dummyTexture.getTexture()
          );
          gl.uniform1i(location, activeTextureIndex);
          activeTextureIndex++;
          break;
        default:
          throw 'invalid uniform type';
      }
    }

    // draw
    gl.drawElements(
      primitives[primitiveType],
      vertexCount,
      gl.UNSIGNED_SHORT,
      startVertexOffset
    );
  }
}
