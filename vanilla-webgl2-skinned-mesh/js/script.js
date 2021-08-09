import GPU from './libs/GPU.js';
import Material from './libs/Material.js';
import Geometry from './libs/Geometry.js';
import Matrix4 from './libs/Matrix4.js';
import Vector3 from './libs/Vector3.js';
import MeshActor from './libs/MeshActor.js';
import CameraActor from './libs/CameraActor.js';
import ScriptComponent from './libs/ScriptComponent.js';
import PerspectiveCamera from './libs/PerspectiveCamera.js';
import DirectionalLight from './libs/DirectionalLight.js';
import LightActor from './libs/LightActor.js';
import Attribute from './libs/Attribute.js';
import Renderer from './libs/Renderer.js';
import {
  UniformType,
  ActorType,
  AttributeType,
  PrimitiveType,
} from './libs/Constants.js';
import GUIDebugger from './utils/GUIDebugger.js';

new GUIDebugger();

// const debugValues = {};

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

let floorMeshActor;

const renderer = new Renderer({ gpu });

const perspectiveCameraActor = new CameraActor({
  camera: new PerspectiveCamera(0.5, 1, 0.1, 30),
  components: [
    new ScriptComponent({
      updateFunc: ({ actor }) => {
        const w = 10;
        const h = 10;
        const dumping = 0.05;
        const targetX = w * states.mouseX;
        const targetY = h * states.mouseY;

        const p = new Vector3(
          actor.position.x + (targetX - actor.position.x) * dumping,
          actor.position.y + (targetY - actor.position.y) * dumping,
          15,
        );
        actor.setPosition(p);
      },
    }),
  ],
});
perspectiveCameraActor.setLookAt(new Vector3(0, 0.5, 0));

actors.push(perspectiveCameraActor);

const lightActor = new LightActor({
  gpu,
  light: new DirectionalLight({
    color: new Vector3(1, 1, 1),
    intensity: 1,
  }),
  components: [
    new ScriptComponent({
      startFunc: ({ actor }) => {
        actor.setPosition(new Vector3(4, 4, 4));
      },
    }),
  ],
});

actors.push(lightActor);

const vertexShader = `#version 300 es

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

const fragmentShader = `#version 300 es

precision mediump float;

in vec2 vUv;

out vec4 outColor;

void main() {
  outColor = vec4(vUv.xy, 1., 1.);
}
`;

const init = async () => {
  const uniforms = {};

  const syncValueComponent = new ScriptComponent({
    updateFunc: ({ actor }) => {
      // NOTE: 多分いらない
      if (!actor.isType(ActorType.MeshActor)) {
        return;
      }

      // // TODO: renderer側で更新したい
      // actor.material.uniforms['uLight.position'].data = lightActor.position;
      // actor.material.uniforms['uLight.color'].data = lightActor.light.color;
      // actor.material.uniforms['uLight.intensity'].data =
      //   lightActor.light.intensity;
      // actor.material.uniforms['uLight.attenuation'].data =
      //   lightActor.light.attenuation;
    },
  });

  //
  // plane vertex positions
  //
  // 3 --------- 2
  // |         / |
  // |       /   |
  // |     /     |
  // |   /       |
  // | /         |
  // 0 --------- 1

  // prettier-ignore
  const floorNormals = [
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
    0, 0, 1,
  ];

  const floorGeometry = new Geometry({
    gpu,
    attributes: [
      new Attribute({
        type: AttributeType.Position,
        // prettier-ignore
        data: [
          -1, -1, 0,
          1, -1, 0,
          1, 1, 0,
          -1, 1, 0,
        ],
        stride: 3,
      }),
      new Attribute({
        type: AttributeType.Uv,
        // prettier-ignore
        data: [
          0, 0,
          1, 0,
          1, 1,
          0, 1,
        ],
        stride: 2,
      }),
    ],
    indices: [0, 1, 2, 0, 2, 3],
  });

  const floorMaterial = new Material({
    gpu,
    vertexShader,
    fragmentShader,
    uniforms,
    primitiveType: PrimitiveType.Triangles,
  });

  floorMeshActor = new MeshActor({
    name: 'floor',
    geometry: floorGeometry,
    material: floorMaterial,
    components: [
      new ScriptComponent({
        updateFunc: function ({ actor, time, deltaTime }) {
          actor.setPosition(new Vector3(0, -1, 0));
          actor.setRotationX((90 * Math.PI) / 180);
          actor.setScale(new Vector3(4, 4, 4));
        },
      }),
      syncValueComponent.clone(),
    ],
  });

  actors.push(floorMeshActor);
};

const onWindowResize = () => {
  states.isResized = true;
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
      const ratio = Math.min(window.devicePixelRatio, 1);

      states.viewportWidth = wrapperElement.offsetWidth;
      states.viewportHeight = wrapperElement.offsetHeight;
      const targetWidth = Math.floor(states.viewportWidth * ratio);
      const targetHeight = Math.floor(states.viewportHeight * ratio);
      canvasElement.width = targetWidth;
      canvasElement.height = targetHeight;

      renderer.setSize(targetWidth, targetHeight);

      actors.forEach((actor) =>
        actor.setSize({ width: targetWidth, height: targetHeight }),
      );

      states.isResized = false;
    }
  }

  // start
  {
    actors.forEach((actor) => actor.start({ time, deltaTime }));
  }

  // update
  {
    actors.forEach((actor) => actor.update({ time, deltaTime }));
  }

  // before render for update matrix etc...
  {
    actors.forEach((actor) => {
      actor.transform.updateModelMatrix();
    });
  }

  // render
  {
    const meshActors = actors.filter(
      (actor) => actor.type === ActorType.MeshActor,
    );

    const lightActors = actors.filter(
      (actor) => actor.type === ActorType.LightActor,
    );

    const cameraActors = actors.filter(
      (actor) => actor.type === ActorType.CameraActor,
    );

    gpu.flush();

    for (let i = 0; i < cameraActors.length; i++) {
      const cameraActor = cameraActors[i];
      renderer.renderScene({
        meshActors,
        lightActors,
        cameraActor,
      });
    }
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
