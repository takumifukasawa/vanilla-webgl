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
layout (location = 2) in vec3 aColor;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

out vec2 vUv;
out vec3 vColor;

void main() {
  vColor = aColor;
  vUv = aUv;
  vec4 pos = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.);
  gl_Position = pos;
}
`;

const fragmentShader = `#version 300 es
precision mediump float;

in vec3 vColor;
in vec2 vUv;

uniform sampler2D uTexture;

out vec4 outColor;

void main() {
  vec4 texColor = texture(uTexture, vUv);
  outColor = texColor;
  // outColor = vec4(vUv, 1, 1);
}
`;

const geometry = new Geometry({
  gpu,
  attributes: {
    aPosition: {
      // prettier-ignore
      data: [
          -0.5, 0.5, 0, // left top
          0.5, 0.5, 0, // right top
          -0.5, -0.5, 0, // left bottom
          0.5, -0.5, 0, // right bottom
        ],
      stride: 3,
    },
    aUv: {
      // prettier-ignore
      data: [
        0, 0,
        1, 0,
        0, 1,
        1, 1
      ],
      stride: 2,
    },
    aColor: {
      // prettier-ignore
      data: [
          1, 0, 0,
          0, 1, 0,
          0, 0, 1,
          1, 1, 0,
        ],
      stride: 3,
    },
  },
  indices: [0, 2, 1, 1, 2, 3],
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
    uTexture: {
      type: GPU.UniformTypes.Texture2D,
      data: null,
    },
  },
});

(async () => {
  const img = await loadImg('./img/dir-x-plus.png');
  const texture = new Texture({ gpu, img });
  material.uniforms.uTexture.data = texture;
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
      actor.worldTransform = Matrix4.createRotateYMatrix(time);
    },
  })
);
actors.push(planeMeshActor);

const perspectiveCamera = new PerspectiveCamera(0.5, 1, 0.01, 20);

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
      const ratio = Math.max(window.devicePixelRatio, 0.5);
      const targetWidth = wrapperElement.offsetWidth / ratio;
      const targetHeight = wrapperElement.offsetHeight / ratio;
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
