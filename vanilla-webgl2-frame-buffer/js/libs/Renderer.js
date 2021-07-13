import Material from './Material.js';

export default class Renderer {
  constructor() {}
  render({
    gpu,
    time,
    deltaTime,
    geometry,
    material,
    modelMatrix,
    viewMatrix,
    projectionMatrix,
    normalMatrix,
    cameraPosition,
  }) {
    // stateの切り替えはアプリケーションレベルで行う
    const gl = gpu.gl;

    // check depth
    gl.enable(gl.DEPTH_TEST);

    // culling
    switch (material.face) {
      case Material.Face.Front:
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.BACK);
        break;
      case Material.Face.Back:
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.FRONT);
        break;
      case Material.Face.DoubleSide:
        gl.disable(gl.CULL_FACE);
        break;
      case Material.Face.None:
        gl.enable(gl.CULL_FACE);
        gl.cullFace(gl.FRONT_AND_BACK);
        break;
    }

    if (material.transparent) {
      gl.depthMask(false);
      gl.enable(gl.BLEND);
      switch (material.blendType) {
        case GPU.BlendTypes.Alpha:
          gl.blendFuncSeparate(
            gl.SRC_ALPHA,
            gl.ONE_MINUS_SRC_ALPHA,
            gl.ONE,
            gl.ONE,
          );
          break;
        case GPU.BlendTypes.Additive:
          gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE, gl.ONE, gl.ONE);
          break;
        default:
          throw 'should specify blend type';
      }
    } else {
      gl.depthMask(true);
      gl.depthFunc(gl.LEQUAL);
      gl.disable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ZERO);
    }

    material.updateUniforms({
      modelMatrix,
      viewMatrix,
      projectionMatrix,
      normalMatrix,
      cameraPosition,
    });

    gpu.setShader(material.shader);
    gpu.setVertex(geometry.vao);
    // gpu.setAttributes(geometry.attributes);
    // gpu.setTextures(material.textures);
    gpu.setUniforms(material.uniforms);
    if (geometry.indices) {
      gpu.setIndices(geometry.indices);
      gpu.draw(geometry.indices.length, material.primitiveType);
    } else {
      // TODO: attributeのvertexにtypeをもたせる
      gpu.draw(geometry.vertexCount, material.primitiveType);
    }
    gpu.resetData();
  }
}
