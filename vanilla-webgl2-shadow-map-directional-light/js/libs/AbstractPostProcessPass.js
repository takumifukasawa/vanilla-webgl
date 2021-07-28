import Engine from './Engine.js';
import Geometry from './Geometry.js';
import RenderTarget from './RenderTarget.js';

//
// plane vertex positions
//
// 3 ----------2
// |         / |
// |       /   |
// |     /     |
// |   /       |
// | /         |
// 0 --------- 1
//

const vertexShader = `#version 300 es

layout (location = 0) in vec3 aPosition;
layout (location = 1) in vec2 aUv;

out vec2 vUv;

void main() {
  vUv = aUv;
  gl_Position = vec4(aPosition, 1.);
}
`;

// TODO:
// - postprocess用のgeometry,material作る関数をクラスから剥がして外部化してもいい
export default class AbstractPostProcessPass {
  geometry;
  material;
  vertexShader = vertexShader;
  defaultRenderTarget;

  getRenderTarget() {
    return this.defaultRenderTarget;
  }

  // 外部化してもよい
  createPostProcessPlaneGeometry({ gpu }) {
    return new Geometry({
      gpu,
      attributes: [
        {
          type: Engine.AttributeType.Position,
          // prettier-ignore
          data: [
            -1, -1, 0,
            1, -1, 0,
            1, 1, 0,
            -1, 1, 0,
        ],
          stride: 3,
        },
        {
          type: Engine.AttributeType.Uv,
          // prettier-ignore
          data: [
            0, 0,
            1, 0,
            1, 1,
            0, 1,
          ],
          stride: 2,
        },
      ],
      indices: [0, 1, 2, 0, 2, 3],
    });
  }

  constructor({ gpu, needsCreateDefaultRenderTarget = false }) {
    if (needsCreateDefaultRenderTarget) {
      this.defaultRenderTarget = new RenderTarget({ gpu, useDepth: false });
    }
  }

  setSize(width, height) {
    if (this.defaultRenderTarget) {
      this.defaultRenderTarget.setSize(width, height);
    }
  }

  setupRenderTarget({ renderer, renderToCamera, renderTarget }) {
    if (renderToCamera) {
      if (renderTarget) {
        throw 'renderToCamera and renderTarget is passed. should pass either one.';
      }
      renderer.clearRenderTarget();
    } else {
      if (renderTarget) {
        renderer.setRenderTarget(renderTarget);
      } else {
        renderer.setRenderTarget(this.getRenderTarget());
      }
    }
  }

  // 前フレームの描画済renderTargetが渡される
  // renderToCamera: false かつ renderTarget: true な場合は存在しないはず
  render({ renderer, beforePassRenderTarget, renderToCamera, renderTarget }) {
    throw "should override 'render' method";
  }
}
