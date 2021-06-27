import GPU from './libs/GPU.js';
import Material from './libs/Material.js';
import Geometry from './libs/Geometry.js';
import PerspectiveCamera from './libs/PerspectiveCamera.js';
import { Matrix4 } from './libs/Matrix.js';
import { Vector3 } from './libs/Vector3.js';
import Actor from './libs/Actor.js';
import MeshActor from './libs/MeshActor.js';
import MeshComponent from './libs/MeshComponent.js';
import ScriptComponent from './libs/ScriptComponent.js';
import loadImg from './utils/loadImg.js';
import Texture from './libs/Texture.js';
import loadObj from './libs/loadObj.js';

const wrapperElement = document.querySelector('.js-wrapper');
const canvasElement = document.querySelector('.js-canvas');

const gpu = new GPU({
  canvasElement,
});

const actors = [];

const states = {
  isResized: false,
  viewportWidth: 0,
  viewportHeight: 0,
  mouseX: 0,
  mouseY: 0,
};

let startTime = null;
let beforeTime = null;
let deltaTime = 0;

const planeVertexShader = `#version 300 es

layout (location = 0) in vec3 aPosition;
layout (location = 1) in vec2 aUv;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

out vec2 vUv;

void main() {
  vUv = aUv;
  gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.);
}
`;

const planeFragmentShader = `#version 300 es
precision mediump float;

in vec2 vUv;

out vec4 outColor;

void main() {
  outColor = vec4(vUv, 1., 1.);
}
`;

const particleVertexShader = `#version 300 es

layout (location = 0) in vec3 aPosition;
layout (location = 1) in vec2 aUv;
layout (location = 2) in vec2 aOffset;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform float uBillboardSize;

out vec2 vUv;

void main() {
  vUv = aUv;
  vec4 viewPosition = uViewMatrix * uModelMatrix * vec4(aPosition, 1.);
  viewPosition.xy += aOffset * uBillboardSize;
  gl_Position = uProjectionMatrix * viewPosition;
}
`;

const particleFragmentShader = `#version 300 es
precision mediump float;

in vec2 vUv;
out vec4 outColor;

void main() {
  vec2 coord = vUv * vec2(2) - vec2(1);
  float c = 1. - length(coord);
  outColor = vec4(.8, .6, .5, c);
}
`;

const init = async () => {
  const objGeometry = await loadObj('./model/cube.obj');

  //
  // vertex positions
  //
  //      4----------5
  //    / |        / |
  //  /   |      /   |
  // 0 ------- 1     |
  // |    6----|-----7
  // |   /     |   /
  // | /       | /
  // 2 ------- 3
  const planeGeometry = new Geometry({
    gpu,
    attributes: {
      aPosition: {
        // prettier-ignore
        data: objGeometry.positions,
        stride: 3,
      },
      aUv: {
        data: objGeometry.uvs,
        stride: 2,
      },
    },
    indices: objGeometry.indices,
  });

  const planeMaterial = new Material({
    gpu,
    vertexShader: planeVertexShader,
    fragmentShader: planeFragmentShader,
    uniforms: {
      uModelMatrix: {
        type: GPU.UniformTypes.Matrix4fv,
        data: Matrix4.identity().getArray(),
      },
      uViewMatrix: {
        type: GPU.UniformTypes.Matrix4fv,
        data: Matrix4.identity().getArray(),
      },
      uProjectionMatrix: {
        type: GPU.UniformTypes.Matrix4fv,
        data: Matrix4.identity().getArray(),
      },
      uTextureXPlus: {
        type: GPU.UniformTypes.Texture2D,
        data: null,
      },
      uTextureXMinus: {
        type: GPU.UniformTypes.Texture2D,
        data: null,
      },
      uTextureYPlus: {
        type: GPU.UniformTypes.Texture2D,
        data: null,
      },
      uTextureYMinus: {
        type: GPU.UniformTypes.Texture2D,
        data: null,
      },
      uTextureZPlus: {
        type: GPU.UniformTypes.Texture2D,
        data: null,
      },
      uTextureZMinus: {
        type: GPU.UniformTypes.Texture2D,
        data: null,
      },
    },
    primitiveType: GPU.Primitives.Triangle,
  });

  const planeMeshActor = new MeshActor({
    meshComponent: new MeshComponent({
      geometry: planeGeometry,
      material: planeMaterial,
    }),
  });

  planeMeshActor.addComponent(
    new ScriptComponent({
      updateFunc: function ({ actor, time, deltaTime }) {
        const t = Matrix4.multiplyMatrices(
          // Matrix4.createTranslationMatrix(
          //   new Vector3(
          //     Math.sin(time * 0.2) * 0.5,
          //     Math.sin(time * 0.4) * 0.9,
          //     Math.sin(time * 0.9) * 0.8
          //   )
          // ),
          Matrix4.createRotationXMatrix(time * 0.7),
          Matrix4.createRotationYMatrix(time * 0.8),
          Matrix4.createRotationZMatrix(time * 0.9)
          // Matrix4.createScalingMatrix(new Vector3(1.4, 2, 1.2))
        );
        actor.worldTransform = t;
      },
    })
  );

  actors.push(planeMeshActor);

  //
  // vertex positions
  //
  // 0 ----------1
  // |         / |
  // |       /   |
  // |     /     |
  // |   /       |
  // | /         |
  // 2 --------- 3
  const particleGeometry = new Geometry({
    gpu,
    attributes: {
      aPosition: {
        data: new Array(2000)
          .fill(0)
          .map(() => {
            const baseX = Math.random() * 10 - 5;
            const baseY = Math.random() * 10 - 5;
            const baseZ = Math.random() * 10 - 5;
            // prettier-ignore
            return [
            baseX, baseY, baseZ,
            baseX, baseY, baseZ,
            baseX, baseY, baseZ,
            baseX, baseY, baseZ,
          ];
          })
          .flat(),
        stride: 3,
      },
      aUv: {
        data: new Array(2000)
          .fill(0)
          .map(() => {
            // prettier-ignore
            return [
            0, 0,
            1, 0,
            0, 1,
            1, 1
          ]
          })
          .flat(),
        stride: 2,
      },
      aOffset: {
        data: new Array(2000)
          .fill(0)
          .map(() => {
            // prettier-ignore
            return [
            -0.5, 0.5,
            0.5, 0.5,
            -0.5, -0.5,
            0.5, -0.5,
          ];
          })
          .flat(),
        stride: 2,
      },
    },
    indices: new Array(2000)
      .fill(0)
      .map((_, i) => {
        const offset = i * 4;
        // prettier-ignore
        return  [
          0 + offset, 2 + offset, 1 + offset,
          1 + offset, 2 + offset, 3 + offset,
        ]
      })
      .flat(),
  });

  const particleMaterial = new Material({
    gpu,
    vertexShader: particleVertexShader,
    fragmentShader: particleFragmentShader,
    uniforms: {
      uModelMatrix: {
        type: GPU.UniformTypes.Matrix4fv,
        data: Matrix4.identity().getArray(),
      },
      uViewMatrix: {
        type: GPU.UniformTypes.Matrix4fv,
        data: Matrix4.identity().getArray(),
      },
      uProjectionMatrix: {
        type: GPU.UniformTypes.Matrix4fv,
        data: Matrix4.identity().getArray(),
      },
      uBillboardSize: {
        type: GPU.UniformTypes.Float,
        data: 0.25,
      },
    },
    primitiveType: GPU.Primitives.Triangles,
    transparent: true,
    blendType: GPU.BlendTypes.Additive,
  });

  const particleMeshActor = new MeshActor({
    meshComponent: new MeshComponent({
      geometry: particleGeometry,
      material: particleMaterial,
    }),
  });

  actors.push(particleMeshActor);
};

const perspectiveCamera = new PerspectiveCamera(0.5, 1, 0.1, 20);

const onWindowResize = () => {
  states.isResized = true;
};

// NOTE: renderer的なクラスにするのがよい
const render = ({
  gpu,
  time,
  deltaTime,
  geometry,
  material,
  modelMatrix,
  viewMatrix,
  projectionMatrix,
}) => {
  // stateの切り替えはアプリケーションレベルで行う
  const gl = gpu.getGl();

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);

  if (material.transparent) {
    gl.depthMask(false);
    gl.enable(gl.BLEND);
    switch (material.blendType) {
      case GPU.BlendTypes.Alpha:
        gl.blendFuncSeparate(
          gl.SRC_ALPHA,
          gl.ONE_MINUS_SRC_ALPHA,
          gl.ONE,
          gl.ONE
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

  material.updateUniforms({ modelMatrix, viewMatrix, projectionMatrix });
  gpu.setShader(material.shader);
  gpu.setAttributes(geometry.attributes);
  // gpu.setTextures(material.textures);
  gpu.setUniforms(material.uniforms);
  // TODO: primitiveの種別とindicesがあるかないかで判断するのが正しい
  if (material.primitiveType === GPU.Primitives.Points) {
    gpu.draw(
      geometry.attributes.aPosition.data.length / 3,
      material.primitiveType
    );
  } else {
    gpu.setIndices(geometry.indices);
    gpu.draw(geometry.indices.data.length, material.primitiveType);
  }
  gpu.resetData();
};

const tick = (t) => {
  // skip first frame
  if (startTime === null) {
    startTime = t / 1000;
    beforeTime = t / 1000;
    requestAnimationFrame(tick);
    return;
  }

  const time = t / 1000 - startTime;
  deltaTime = time - beforeTime;

  // before update
  {
    if (states.isResized) {
      const ratio = Math.min(window.devicePixelRatio, 0.5);
      states.viewportWidth = wrapperElement.offsetWidth;
      states.viewportHeight = wrapperElement.offsetHeight;
      const targetWidth = states.viewportWidth * ratio;
      const targetHeight = states.viewportHeight * ratio;
      canvasElement.width = targetWidth;
      canvasElement.height = targetHeight;
      gpu.setSize(targetWidth, targetHeight);
      perspectiveCamera.updateProjectionMatrix(targetWidth / targetHeight);
      states.isResized = false;
    }
  }

  // gpu.getGl().colorMask(true, true, true, true);
  // gpu.getGl().colorMask(false, false, false, true);
  gpu.clear(0, 0, 0, 1);

  // update
  {
    const w = 10;
    const h = 10;
    const dumping = 0.05;
    const targetX = w * states.mouseX;
    const targetY = h * states.mouseY;
    perspectiveCamera.position.x +=
      (targetX - perspectiveCamera.position.x) * dumping;
    perspectiveCamera.position.y +=
      (targetY - perspectiveCamera.position.y) * dumping;
    perspectiveCamera.position.z = 10;
    const lookAtCameraMatrix = Matrix4.createLookAtCameraMatrix(
      perspectiveCamera.position,
      new Vector3(0, 0, 0),
      new Vector3(0, 1, 0)
    );
    perspectiveCamera.cameraMatrix = lookAtCameraMatrix;

    actors.forEach((actor) => actor.update({ time, deltaTime }));
  }

  // render
  {
    const meshActors = actors.filter(
      (actor) => actor.type === Actor.Types.MeshActor
    );
    meshActors.forEach((meshActor) => {
      render({
        gpu,
        time,
        deltaTime,
        geometry: meshActor.meshComponent.geometry,
        material: meshActor.meshComponent.material,
        modelMatrix: meshActor.worldTransform,
        viewMatrix: perspectiveCamera.cameraMatrix.getInvertMatrix(),
        projectionMatrix: perspectiveCamera.projectionMatrix,
      });
    });
  }

  beforeTime = time;

  requestAnimationFrame(tick);
};

const main = async () => {
  onWindowResize();
  window.addEventListener('resize', () => {
    onWindowResize();
  });
  window.addEventListener('mousemove', (e) => {
    const ww = wrapperElement.offsetWidth;
    const wh = wrapperElement.offsetWidth;
    const mx = e.clientX;
    const my = e.clientY;
    const x = (mx / ww) * 2 - 1;
    const y = ((my / wh) * 2 - 1) * -1;
    states.mouseX = x;
    states.mouseY = y;
  });
  await init();
  requestAnimationFrame(tick);
};

main();
