import GPU from './libs/GPU.js';
import Material from './libs/Material.js';
import Geometry from './libs/Geometry.js';
import PerspectiveCamera from './libs/PerspectiveCamera.js';
import { Matrix4 } from './libs/Matrix4.js';
import { Vector3 } from './libs/Vector3.js';
import Actor from './libs/Actor.js';
import MeshActor from './libs/MeshActor.js';
import MeshComponent from './libs/MeshComponent.js';
import ScriptComponent from './libs/ScriptComponent.js';
import loadObj from './libs/loadObj.js';
import DirectionalLight from './libs/DirectionalLight.js';

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

let objMeshActor;
let floorMeshActor;

const perspectiveCamera = new PerspectiveCamera(0.5, 1, 0.1, 40);

const directionalLight = new DirectionalLight({
  color: Vector3.one(),
  position: Vector3.one(),
});

const baseVertexShader = `#version 300 es

layout (location = 0) in vec3 aPosition;
layout (location = 1) in vec2 aUv;
layout (location = 2) in vec3 aNormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uNormalMatrix;

out vec2 vUv;
out vec3 vNormal;

void main() {
  vUv = aUv;
  vNormal = normalize(uNormalMatrix * vec4(normalize(aNormal), 1.)).xyz;
  gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.);
}
`;

const lambertFragmentShader = `#version 300 es
precision mediump float;
uniform vec3 uDirectionalLightPosition;
in vec3 vNormal;
out vec4 outColor;
void main() {
  vec3 L = normalize(uDirectionalLightPosition);
  vec3 N = vNormal;
  float diffuse = dot(L, N);
  outColor = vec4(vec3(diffuse), 1.);
}
`;

const init = async () => {
  // const data = await loadObj('./model/suzanne.obj');
  const data = await loadObj('./model/torus-48x48.obj');

  const objGeometry = new Geometry({
    gpu,
    attributes: {
      aPosition: {
        data: data.positions,
        stride: 3,
      },
      aUv: {
        data: data.uvs,
        stride: 2,
      },
      aNormal: {
        data: data.normals,
        stride: 3,
      },
    },
  });

  const objMaterial = new Material({
    gpu,
    vertexShader: baseVertexShader,
    fragmentShader: lambertFragmentShader,
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
      uNormalMatrix: {
        type: GPU.UniformTypes.Matrix4fv,
        data: Matrix4.identity().getArray(),
      },
      uDirectionalLightPosition: {
        type: GPU.UniformTypes.Vector3f,
        data: directionalLight.position.getArray(),
      },
    },
    primitiveType: GPU.Primitives.Triangle,
  });

  objMeshActor = new MeshActor({
    meshComponent: new MeshComponent({
      geometry: objGeometry,
      material: objMaterial,
    }),
  });

  objMeshActor.addComponent(
    new ScriptComponent({
      updateFunc: function ({ actor, time, deltaTime }) {
        const t = Matrix4.multiplyMatrices(
          //   new Vector3(
          //     Math.sin(time * 0.2) * 0.5,
          //     Math.sin(time * 0.4) * 0.9,
          //     Math.sin(time * 0.9) * 0.8
          //   )
          // ),
          Matrix4.createRotationXMatrix(time * 0.2),
          Matrix4.createRotationYMatrix(time * 0.3),
          Matrix4.createRotationZMatrix(time * 0.4)
          // Matrix4.createScalingMatrix(new Vector3(1.4, 2, 1.2))
        );
        actor.worldTransform = t;
      },
    })
  );

  actors.push(objMeshActor);

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
  const floorGeometry = new Geometry({
    gpu,
    attributes: {
      aPosition: {
        // prettier-ignore
        data: [
          -3, 3, 0,
          3, 3, 0,
          -3, -3, 0,
          3, -3, 0,
        ],
        stride: 3,
      },
      aUv: {
        // prettier-ignore
        data: [
          0, 0,
          1, 0,
          0, 1,
          1, 1,
        ],
        stride: 2,
      },
      aNormal: {
        // prettier-ignore
        data: [
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
          0, 0, 1,
        ],
        stride: 3,
      },
    },
    indices: [0, 2, 1, 1, 2, 3],
  });

  const floorMaterial = new Material({
    gpu,
    vertexShader: baseVertexShader,
    fragmentShader: lambertFragmentShader,
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
      uNormalMatrix: {
        type: GPU.UniformTypes.Matrix4fv,
        data: Matrix4.identity().getArray(),
      },
      uDirectionalLightPosition: {
        type: GPU.UniformTypes.Vector3f,
        data: directionalLight.position.getArray(),
      },
    },
    primitiveType: GPU.Primitives.Triangles,
  });

  floorMeshActor = new MeshActor({
    meshComponent: new MeshComponent({
      geometry: floorGeometry,
      material: floorMaterial,
    }),
  });

  floorMeshActor.addComponent(
    new ScriptComponent({
      startFunc: function ({ actor, time, deltaTime }) {
        const t = Matrix4.multiplyMatrices(
          Matrix4.createTranslationMatrix(new Vector3(0, -1.5, 0)),
          Matrix4.createRotationXMatrix(Math.PI * 0.5)
        );
        actor.worldTransform = t;
      },
    })
  );

  actors.push(floorMeshActor);
};

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
  normalMatrix,
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

  material.updateUniforms({
    modelMatrix,
    viewMatrix,
    projectionMatrix,
    normalMatrix,
  });

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
    if (geometry.indices) {
      gpu.setIndices(geometry.indices);
      gpu.draw(geometry.indices.data.length, material.primitiveType);
    } else {
      gpu.setIndices(geometry.indices);
      gpu.draw(
        geometry.attributes.aPosition.data.length / 3,
        material.primitiveType
      );
    }
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
      const ratio = Math.min(window.devicePixelRatio, 1.5);
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

  // clear context
  gpu.clear(0, 0, 0, 1);

  // start
  {
    actors.forEach((actor) => actor.start({ time, deltaTime }));
  }

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
        viewMatrix: perspectiveCamera.cameraMatrix.clone().inverse(),
        projectionMatrix: perspectiveCamera.projectionMatrix,
        normalMatrix: meshActor.worldTransform.clone().inverse().transpose(),
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
