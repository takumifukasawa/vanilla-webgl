import GLObject from './GLObject.js';

export default class CubeMap extends GLObject {
  #texture;

  get glObject() {
    return this.#texture;
  }

  constructor({ gpu, images, targets }) {
    super();

    const gl = gpu.gl;

    this.#texture = gl.createTexture();

    targets = targets || [
      gl.TEXTURE_CUBE_MAP_POSITIVE_X,
      gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
      gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
      gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
      gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
      gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
      // gl.TEXTURE_CUBE_MAP_POSITIVE_X,
      // gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
      // gl.TEXTURE_CUBE_MAP_POSITIVE_Z,
      // gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
      // gl.TEXTURE_CUBE_MAP_POSITIVE_Y,
      // gl.TEXTURE_CUBE_MAP_NEGATIVE_Z,
    ];

    gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.#texture);

    // gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);

    images.forEach((img, i) => {
      gl.texImage2D(targets[i], 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    });

    // TODO: flag
    gl.generateMipmap(gl.TEXTURE_CUBE_MAP);

    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
  }
}
