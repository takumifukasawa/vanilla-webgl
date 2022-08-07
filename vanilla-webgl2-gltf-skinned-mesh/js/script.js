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
import loadGLTF from './libs/loadGLTF.js';
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

let skinnedMeshActor;
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

const floorVertexShader = `#version 300 es

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

const floorFragmentShader = `#version 300 es

precision mediump float;

in vec2 vUv;

out vec4 outColor;

void main() {
  outColor = vec4(vUv.xy, 1., 1.);
}
`;

const skinnedMeshVertexShader = `#version 300 es

layout (location = 0) in vec3 aPosition;
layout (location = 1) in vec2 aUv;
layout (location = 2) in uvec4 aBoneIndices;
layout (location = 3) in vec4 aBoneWeights;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 boneMatrices[4];

// out vec2 vUv;
out vec4 vColor;

void main() {
  // vUv = aUv;

  vec4 position = vec4(aPosition, 1.);
  vec4 p =
    boneMatrices[aBoneIndices[0]] * position * aBoneWeights[0] +
    boneMatrices[aBoneIndices[1]] * position * aBoneWeights[1] +
    boneMatrices[aBoneIndices[2]] * position * aBoneWeights[2] +
    boneMatrices[aBoneIndices[3]] * position * aBoneWeights[3];
    // boneMatrices[aBoneIndices[0]] * position * 0.+
    // boneMatrices[aBoneIndices[1]] * position * 0.+
    // boneMatrices[aBoneIndices[2]] * position * 0.+
    // boneMatrices[aBoneIndices[3]] * position * 1.;

  mat4 m = boneMatrices[2];
  vColor = vec4(m[1][0], m[1][1], m[1][2], m[1][3]);
  vColor = vec4(aBoneWeights);
  // vColor = vec4(aBoneIndices[0], aBoneIndices[1], aBoneIndices[2], aBoneIndices[3]);

  gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * p;
  // gl_Position = uProjectionMatrix * uViewMatrix * position;
}
`;

const skinnedMeshFragmentShader = `#version 300 es

precision mediump float;

// in vec2 vUv;
in vec4 vColor;

out vec4 outColor;

void main() {
  // outColor = vec4(vUv.xy, 1., 1.);
  outColor = vec4(vColor.rgb, 1.);
}
`;

const init = async () => {
  const gltf = await loadGLTF({
    gpu,
    // gltfPath: './model/simple-meshes.gltf',
    gltfPath: './model/simple-skin.gltf',
  });
  console.log(gltf);

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
  // 手動でskinnedMeshを作成
  // 8 --- B2 --- 9
  // |     |      |
  // 6 --- |  --- 7
  // |     |      |
  // 4 --- B1 --- 5
  // |     |      |
  // 2 --- |  --- 3
  // |     |      |
  // 0 --- B0 --- 1
  //

  // シェーダーに渡すbone行列群
  const computeBones = (angleX, angleY, angleZ) => {
    let m0 = Matrix4.identity();
    let m1 = Matrix4.identity();
    let m2 = Matrix4.identity();
    let m3 = Matrix4.identity();

    m1 = Matrix4.multiplyMatrices(
      Matrix4.createTranslationMatrix(new Vector3(0, 2, 0)),
      Matrix4.createRotationYMatrix(angleY),
      Matrix4.createRotationXMatrix(angleX),
      Matrix4.createRotationZMatrix(angleZ),
      m0.clone(),
    );

    m2 = Matrix4.multiplyMatrices(
      Matrix4.createTranslationMatrix(new Vector3(0, 2, 0)),
      Matrix4.createRotationYMatrix(angleY),
      Matrix4.createRotationXMatrix(angleX),
      Matrix4.createRotationZMatrix(angleZ),
      m1.clone(),
    );

    return [m0, m1, m2, m3];
  };

  // ここでは要素確保用初期化
  let boneMatrices = Array.from(new Array(4)).map(() => Matrix4.identity());

  // 初期姿勢を計算
  const bindPoseMatrices = computeBones(0, 0, 0);

  // 初期姿勢の逆行列を生成。
  // 位置を戻してから回転などを加えるため
  const bindPoseInvMatrices = bindPoseMatrices.map((m) => m.clone().inverse());

  const updateBoneMatrices = (bones) => {
    boneMatrices = bones.map((bone, i) =>
      // 初期姿勢の逆行列に現在のboneの変形を加える
      Matrix4.multiplyMatrices(bone.clone(), bindPoseInvMatrices[i].clone()),
    );
  };

  updateBoneMatrices(bindPoseMatrices);

  console.log('--- init ---');
  console.log('bindPoseMatrices', bindPoseMatrices);
  console.log('bindPoseInvMatrices', bindPoseInvMatrices);
  console.log('boneMatrices', boneMatrices);
  console.log('------------');

  const skinnedMeshGeometry = new Geometry({
    gpu,
    attributes: [
      new Attribute({
        type: AttributeType.Position,
        // prettier-ignore
        data: [
          -0.5, 0,  0,  // 0
           0.5, 0,  0,  // 1
          -0.5, 1,  0,  // 2
           0.5, 1,  0,  // 3
          -0.5, 2,  0,  // 4
           0.5, 2,  0,  // 5
          -0.5, 3,  0,  // 6
           0.5, 3,  0,  // 7
          -0.5, 4,  0,  // 8
           0.5, 4,  0,  // 9
        ],
        stride: 3,
      }),
      new Attribute({
        type: AttributeType.Uv,
        // prettier-ignore
        data: [
          0,  0,    // 0
          1,  0,    // 1
          0,  0.25, // 2
          1,  0.25, // 3
          0,  0.5,  // 4
          1,  0.5,  // 5
          0,  0.75, // 6
          1,  0.75, // 7
          0,  1,    // 8
          1,  1,    // 9
        ],
        stride: 2,
      }),
      // 影響を受けるボーンを列挙
      new Attribute({
        type: AttributeType.BoneIndices,
        // prettier-ignore
        data: [
          0, 0, 0, 0, // 0: B0
          0, 0, 0, 0, // 1: B0
          0, 1, 0, 0, // 2: B0,B1
          0, 1, 0, 0, // 3: B0,B1
          1, 0, 0, 0, // 4: B1
          1, 0, 0, 0, // 5: B1
          1, 2, 0, 0, // 6: B1,B2
          1, 2, 0, 0, // 7: B1,B2
          2, 0, 0, 0, // 8: B2
          2, 0, 0, 0, // 9: B2
        ],
        stride: 4,
      }),
      // 影響を受けるボーンの重みを0~1で指定
      new Attribute({
        type: AttributeType.BoneWeights,
        // prettier-ignore
        data: [
          1, 0, 0, 0,     // 0: B0
          1, 0, 0, 0,     // 1: B0
          0.5, 0.5, 0, 0, // 2: B0,B1
          0.5, 0.5, 0, 0, // 3: B0,B1
          1, 0, 0, 0,     // 4: B1
          1, 0, 0, 0,     // 5: B1
          0.5, 0.5, 0, 0, // 6: B1,B2
          0.5, 0.5, 0, 0, // 7: B1,B2
          1, 0, 0, 0,     // 8: B2
          1, 0, 0, 0,     // 9: B2
        ],
        stride: 4,
      }),
    ],
    // prettier-ignore
    indices: [
      2, 0, 3,
      1, 3, 0,
      4, 2, 5,
      3, 5, 2,
      6, 4, 7,
      5, 7, 4,
      8, 6, 9,
      7, 9, 6
    ],
  });

  const skinnedMeshMaterial = new Material({
    gpu,
    vertexShader: skinnedMeshVertexShader,
    fragmentShader: skinnedMeshFragmentShader,
    uniforms,
    uniforms: {
      ...uniforms,
      ...{
        boneMatrices: {
          type: UniformType.Matrix4fv,
          data: boneMatrices,
        },
      },
    },
    primitiveType: PrimitiveType.Triangles,
  });

  skinnedMeshActor = new MeshActor({
    name: 'skinnedMesh',
    geometry: skinnedMeshGeometry,
    material: skinnedMeshMaterial,
    components: [
      syncValueComponent.clone(),
      new ScriptComponent({
        updateFunc: ({ time }) => {
          const angleX = 0;
          const angleY = 0;
          const angleZ = ((Math.sin(time) * 45) / 180) * Math.PI;
          const matrices = computeBones(angleX, angleY, angleZ);
          updateBoneMatrices(matrices);
          skinnedMeshMaterial.uniforms.boneMatrices.data = boneMatrices;
        },
      }),
    ],
  });

  actors.push(skinnedMeshActor);

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
    vertexShader: floorVertexShader,
    fragmentShader: floorFragmentShader,
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
          // actor.setPosition(new Vector3(0, -1, 0));
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
