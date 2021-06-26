import GPU from './libs/GPU.js';
import Material from './libs/Material.js';
import Geometry from './libs/Geometry.js';
import PerspectiveCamera from './libs/PerspectiveCamera.js';
// import Mesh from './libs/Mesh.js';
import { Matrix4 } from './libs/Matrix.js';
import { Vector3 } from './libs/Vector3.js';
import Actor from './libs/Actor.js';
import MeshActor from './libs/MeshActor.js';
import MeshComponent from './libs/MeshComponent.js';
import ScriptComponent from './libs/ScriptComponent.js';
import loadImg from './utils/loadImg.js';
import Texture from './libs/Texture.js';

const wrapperElement = document.querySelector('.js-wrapper');
const canvasElement = document.querySelector('.js-canvas');

const gpu = new GPU({
  canvasElement,
});

const actors = [];

const states = {
  isResized: false,
};

let startTime = null;
let beforeTime = null;
let deltaTime = 0;

const vertexShader = `#version 300 es

layout (location = 0) in vec3 aPosition;
layout (location = 1) in vec2 aUv;
layout (location = 2) in float aTextureIndex;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

out vec2 vUv;
out float vTextureIndex;

void main() {
  vUv = aUv;
  vTextureIndex = aTextureIndex;
  vec4 pos = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.);
  gl_Position = pos;
}
`;

const fragmentShader = `#version 300 es
precision mediump float;

in vec2 vUv;
in float vTextureIndex;

uniform sampler2D uTextureXPlus;
uniform sampler2D uTextureXMinus;
uniform sampler2D uTextureYPlus;
uniform sampler2D uTextureYMinus;
uniform sampler2D uTextureZPlus;
uniform sampler2D uTextureZMinus;

out vec4 outColor;

void main() {
  vec4 texColor = vec4(1.);
  if(vTextureIndex < 0.5) {
    texColor = texture(uTextureZPlus, vUv);
  } else if(vTextureIndex < 1.5) {
    texColor = texture(uTextureZMinus, vUv);
  } else if(vTextureIndex < 2.5) {
    texColor = texture(uTextureXMinus, vUv);
  } else if(vTextureIndex < 3.5) {
    texColor = texture(uTextureXPlus, vUv);
  } else if(vTextureIndex < 4.5) {
    texColor = texture(uTextureYPlus, vUv);
  } else if(vTextureIndex < 5.5) {
    texColor = texture(uTextureYMinus, vUv);
  }

  outColor = texColor;
}
`;

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
const geometry = new Geometry({
  gpu,
  attributes: {
    aPosition: {
      // prettier-ignore
      data: [
        // front: 0,1,2,3
        -0.5, 0.5, 0.5,
        0.5, 0.5, 0.5,
        -0.5, -0.5, 0.5,
        0.5, -0.5, 0.5,
        //  back: 5,4,7,6
        0.5, 0.5, -0.5,
        -0.5, 0.5, -0.5,
        0.5, -0.5, -0.5,
        -0.5, -0.5, -0.5,
        // left: 4,0,6,2
        -0.5, 0.5, -0.5,
        -0.5, 0.5, 0.5,
        -0.5, -0.5, -0.5,
        -0.5, -0.5, 0.5,
        // right: 1,5,3,7
        0.5, 0.5, 0.5,
        0.5, 0.5, -0.5,
        0.5, -0.5, 0.5,
        0.5, -0.5, -0.5,
        // top: 4,5,0,1
        -0.5, 0.5, -0.5,
        0.5, 0.5, -0.5,
        -0.5, 0.5, 0.5,
        0.5, 0.5, 0.5,
        // bottom: 2,3,6,7
        -0.5, -0.5, 0.5,
        0.5, -0.5, 0.5,
        -0.5, -0.5, -0.5,
        0.5, -0.5, -0.5,
      ],
      stride: 3,
    },
    aUv: {
      data: new Array(6)
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
    aTextureIndex: {
      data: new Array(6)
        .fill(0)
        .map((_, i) => {
          return [i, i, i, i];
        })
        .flat(),
      stride: 1,
    },
  },
  indices: new Array(6)
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
  primitiveType: GPU.Primitives.Triangle,
});

const material = new Material({
  gpu,
  vertexShader,
  fragmentShader,
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
});

(async () => {
  const paths = [
    { name: 'uTextureXPlus', path: './img/dir-x-plus.png' },
    { name: 'uTextureXMinus', path: './img/dir-x-minus.png' },
    { name: 'uTextureYPlus', path: './img/dir-y-plus.png' },
    { name: 'uTextureYMinus', path: './img/dir-y-minus.png' },
    { name: 'uTextureZPlus', path: './img/dir-z-plus.png' },
    { name: 'uTextureZMinus', path: './img/dir-z-minus.png' },
  ];
  await Promise.all(
    paths.map(async ({ name, path }) => {
      const img = await loadImg(path);
      const texture = new Texture({ gpu, img });
      material.uniforms[name].data = texture;
    })
  );
})();

const planeMeshActor = new MeshActor({
  meshComponent: new MeshComponent({
    geometry,
    material,
  }),
});
planeMeshActor.addComponent(
  new ScriptComponent({
    updateFunc: function ({ actor, time, deltaTime }) {
      const t = Matrix4.multiplyMatrices(
        Matrix4.createTranslationMatrix(
          new Vector3(
            Math.sin(time * 0.2) * 0.5,
            Math.sin(time * 0.4) * 0.9,
            Math.sin(time * 0.9) * 0.8
          )
        ),
        Matrix4.createRotationXMatrix(time * 0.7),
        Matrix4.createRotationYMatrix(time * 0.8),
        Matrix4.createRotationZMatrix(time * 0.9),
        Matrix4.createScalingMatrix(new Vector3(1.4, 2, 1.2))
      );
      actor.worldTransform = t;
    },
  })
);
actors.push(planeMeshActor);

const perspectiveCamera = new PerspectiveCamera(0.5, 1, 0.1, 20);

const onWindowResize = () => {
  states.isResized = true;
};

// NOTE: class にしてもよい
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
  gl.depthFunc(gl.LEQUAL);
  gl.enable(gl.CULL_FACE);
  material.updateUniforms({ modelMatrix, viewMatrix, projectionMatrix });
  gpu.setShader(material.shader);
  gpu.setAttributes(geometry.attributes);
  gpu.setIndices(geometry.indices);
  // gpu.setTextures(material.textures);
  gpu.setUniforms(material.uniforms);
  gpu.draw(geometry.indices.data.length, GPU.Primitives.Triangle);
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
      const targetWidth = wrapperElement.offsetWidth * ratio;
      const targetHeight = wrapperElement.offsetHeight * ratio;
      canvasElement.width = targetWidth;
      canvasElement.height = targetHeight;
      gpu.setSize(targetWidth, targetHeight);
      perspectiveCamera.updateProjectionMatrix(targetWidth / targetHeight);
      states.isResized = false;
    }
  }

  gpu.clear(0, 0, 0, 0);

  // update
  {
    const lookAtCameraMatrix = Matrix4.createLookAtCameraMatrix(
      new Vector3(0, 0, 10),
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
        geometry,
        material,
        modelMatrix: meshActor.worldTransform,
        viewMatrix: perspectiveCamera.cameraMatrix.getInvertMatrix(),
        projectionMatrix: perspectiveCamera.projectionMatrix,
      });
    });
  }

  beforeTime = time;

  requestAnimationFrame(tick);
};

const main = () => {
  onWindowResize();
  window.addEventListener('resize', () => {
    onWindowResize();
  });
  requestAnimationFrame(tick);
};

main();
