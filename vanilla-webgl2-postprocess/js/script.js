import GPU from './libs/GPU.js';
import Material from './libs/Material.js';
import Geometry from './libs/Geometry.js';
import Matrix4 from './libs/Matrix4.js';
import Vector3 from './libs/Vector3.js';
import MeshActor from './libs/MeshActor.js';
import Actor from './libs/Actor.js';
import CameraActor from './libs/CameraActor.js';
import MeshComponent from './libs/MeshComponent.js';
import ScriptComponent from './libs/ScriptComponent.js';
import PerspectiveCamera from './libs/PerspectiveCamera.js';
// import OrthographicCameraComponent from './libs/OrthographicCameraComponent.js';
import OrthographicCamera from './libs/OrthographicCamera.js';
import loadObj from './libs/loadObj.js';
import DirectionalLight from './libs/DirectionalLight.js';
import loadImg from './utils/loadImg.js';
import Texture from './libs/Texture.js';
import CubeMap from './libs/CubeMap.js';
import Attribute from './libs/Attribute.js';
import Renderer from './libs/Renderer.js';
import RenderTarget from './libs/RenderTarget.js';
import Component from './libs/Component.js';
import PostProcessSinglePass from './libs/PostProcessSinglePass.js';
import PostProcessRgbShiftMirrorYPass from './PostProcessRgbShiftMirrorYPass.js';
import PostProcess from './libs/PostProcess.js';
import Engine from './libs/Engine.js';

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

const renderer = new Renderer({ gpu });

const renderTarget = new RenderTarget({ gpu });

// const perspectiveCamera = new PerspectiveCamera(0.5, 1, 0.1, 50);

const mirrorFragmentShader = `#version 300 es

precision mediump float;

in vec2 vUv;

out vec4 outColor;

uniform sampler2D uSceneTexture;

void main() {
  vec4 sceneColor = texture(uSceneTexture, vec2(1. - vUv.x, vUv.y));
  outColor = sceneColor;
}
`;

const grayScaleFragmentShader = `#version 300 es

precision mediump float;

in vec2 vUv;

out vec4 outColor;

uniform sampler2D uSceneTexture;

void main() {
  vec4 sceneColor = texture(uSceneTexture, vUv);
  float gray = (sceneColor.r + sceneColor.g + sceneColor.b) * 0.333;
  outColor = vec4(vec3(gray), 1.);
}
`;

const perspectiveCameraActor = new CameraActor({
  camera: new PerspectiveCamera(0.5, 1, 0.1, 50),
  // camera: new OrthographicCamera(-3, 3, -3, 3, 0.1, 50),
  lookAt: Vector3.zero(),
  postProcess: new PostProcess({
    gpu,
    passes: [
      // new PostProcessSinglePass({
      //   gpu,
      //   fragmentShader: mirrorFragmentShader,
      // }),
      new PostProcessSinglePass({
        gpu,
        fragmentShader: grayScaleFragmentShader,
      }),
      new PostProcessRgbShiftMirrorYPass({ gpu }),
    ],
  }),
});

actors.push(perspectiveCameraActor);

const directionalLight = new DirectionalLight({
  color: Vector3.one(),
  position: new Vector3(0, 1, 0),
});

const baseVertexShader = `#version 300 es

layout (location = 0) in vec3 aPosition;
layout (location = 1) in vec2 aUv;
layout (location = 2) in vec3 aNormal;
layout (location = 3) in vec3 aTangent;
layout (location = 4) in vec3 aBinormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uNormalMatrix;

out vec2 vUv;
out vec4 vWorldPosition;
out vec3 vNormal;
out vec3 vTangent;
out vec3 vBinormal;

void main() {
  vUv = aUv;

  vNormal = (uNormalMatrix * vec4(aNormal, 1.)).xyz;
  vTangent = (uNormalMatrix * vec4(aTangent, 1.)).xyz;
  vBinormal = (uNormalMatrix * vec4(aBinormal, 1.)).xyz;

  vWorldPosition = uModelMatrix * vec4(aPosition, 1.);

  gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.);
}
`;

const fragmentShader = `#version 300 es

precision mediump float;

uniform vec3 uDirectionalLightPosition;
uniform vec3 uCameraPosition;
uniform sampler2D uBaseColorMap;
uniform sampler2D uNormalMap;
uniform sampler2D uHeightMap;
uniform samplerCube uCubeMap;

in vec2 vUv;
in vec4 vWorldPosition;
in vec3 vNormal;
in vec3 vTangent;
in vec3 vBinormal;

out vec4 outColor;

void main() {
  vec3 lightDir = uDirectionalLightPosition; // for directional light

  vec3 worldPosition = vWorldPosition.xyz;
  vec3 cameraPosition = uCameraPosition;

  vec3 PtoL = lightDir; // for directional light
  vec3 PtoE = normalize(cameraPosition - worldPosition);
  vec3 EtoP = -PtoE;
  vec3 H = normalize(PtoL + PtoE);

  float height = texture(uHeightMap, vUv).r;

  float heightRate = .04;

  vec2 offsetUv = ((EtoP.xy) / EtoP.z) * height * heightRate;
  vec2 uv = vUv - offsetUv;

  float normalBlend = .05;

  vec4 nt = texture(uNormalMap, uv) * 2. - 1.;
  vec3 N = mix(
    vNormal,
    normalize(mat3(vTangent, vBinormal, vNormal) * nt.xyz),
    normalBlend
  );

  vec3 cubeMapDir = reflect(EtoP, N);
  vec4 envMapColor = texture(uCubeMap, cubeMapDir);

  float diffuse = max(0., dot(PtoL, N));
  float specular = max(0., dot(N, H));

  float specularPower = 8.;

  vec3 diffuseColor = texture(uBaseColorMap, uv).rgb;
  vec3 specularColor = envMapColor.rgb;
  vec3 environmentColor = vec3(.025);

  vec3 color = vec3(0.);
  color += diffuseColor * diffuse;
  color += specularColor * pow(specular, specularPower);
  color += environmentColor;

  float eta = .67; // 物体の屈折率。ガラス(1 / 1.6)
  float fresnel = ((1. - eta) * (1. - eta)) / ((1. + eta) * (1. + eta)); // フレネル値
  float reflectionRate = fresnel + (1. - fresnel) * pow(1. - dot(PtoE, N), 5.); // 境界面の反射率

  vec3 raDir = refract(normalize(EtoP), normalize(N), .67);
  vec3 raColor = texture(uCubeMap, raDir).rgb;

  // for debug
  color = mix(envMapColor.rgb, raColor, reflectionRate);
  // color = envMapColor.rgb;

  outColor = vec4(color, 1.);
}
`;

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

uniform sampler2D uBaseColorMap;

out vec4 outColor;

void main() {
  // outColor = texture(uBaseColorMap, vec2(vUv.x, 1. - vUv.y)); // flipY
  outColor = texture(uBaseColorMap, vUv); // flipY
}
`;

const init = async () => {
  const data = await loadObj('./model/sphere-32x32.obj');

  const [
    uvMapImg,
    baseColorMapImg,
    normalMapImg,
    heightMapImg,
    ...cubeMapImages
  ] = await Promise.all([
    loadImg('./img/uv-checker.png'),
    loadImg('./img/Tiles_Wall_001_basecolor.jpg'),
    loadImg('./img/Tiles_Wall_001_normal.jpg'),
    loadImg('./img/Tiles_Wall_001_height.png'),
    loadImg('./img/skybox-px.jpg'),
    loadImg('./img/skybox-py.jpg'),
    loadImg('./img/skybox-pz.jpg'),
    loadImg('./img/skybox-nx.jpg'),
    loadImg('./img/skybox-ny.jpg'),
    loadImg('./img/skybox-nz.jpg'),
    // loadImg('./img/dir-px.png'),
    // loadImg('./img/dir-py.png'),
    // loadImg('./img/dir-pz.png'),
    // loadImg('./img/dir-nx.png'),
    // loadImg('./img/dir-ny.png'),
    // loadImg('./img/dir-nz.png'),
  ]);

  const uvMapTexture = new Texture({ gpu, img: uvMapImg });

  const baseColorMapTexture = new Texture({ gpu, img: baseColorMapImg });

  const normalMapTexture = new Texture({ gpu, img: normalMapImg });

  const heightMapTexture = new Texture({ gpu, img: heightMapImg });

  const cubeMapTexture = new CubeMap({ gpu, images: cubeMapImages });

  const objGeometry = new Geometry({
    gpu,
    attributes: [
      {
        type: Engine.AttributeType.Position,
        data: data.positions,
        stride: 3,
      },
      {
        type: Engine.AttributeType.Uv,
        data: data.uvs,
        stride: 2,
      },
      {
        type: Engine.AttributeType.Normal,
        data: data.normals,
        stride: 3,
      },
      Attribute.createTangent(data.normals),
      Attribute.createBinormal(data.normals),
    ],
  });

  const objMaterial = new Material({
    gpu,
    vertexShader: baseVertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
      uDirectionalLightPosition: {
        type: Engine.UniformType.Vector3f,
        data: directionalLight.position,
      },
      uBaseColorMap: {
        type: Engine.UniformType.Texture2D,
        data: baseColorMapTexture,
      },
      uNormalMap: {
        type: Engine.UniformType.Texture2D,
        data: normalMapTexture,
      },
      uHeightMap: {
        type: Engine.UniformType.Texture2D,
        data: heightMapTexture,
      },
      uCubeMap: {
        type: Engine.UniformType.CubeMap,
        data: cubeMapTexture,
      },
    },
    primitiveType: Engine.PrimitiveType.Triangle,
  });

  objMeshActor = new MeshActor({
    name: 'obj',
    meshComponent: new MeshComponent({
      geometry: objGeometry,
      material: objMaterial,
    }),
  });

  objMeshActor.addComponent(
    new ScriptComponent({
      updateFunc: function ({ actor, time, deltaTime }) {
        const t = Matrix4.multiplyMatrices(
          Matrix4.createRotationYMatrix(time * 0.3),
          Matrix4.createRotationXMatrix(time * 0.4),
          Matrix4.createRotationZMatrix(time * 0.5),
        );
        actor.worldTransform = t;
      },
    }),
  );

  actors.push(objMeshActor);

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

  const floorMaterial = new Material({
    gpu,
    vertexShader: floorVertexShader,
    fragmentShader: floorFragmentShader,
    uniforms: {
      uBaseColorMap: {
        type: Engine.UniformType.Texture2D,
        data: uvMapTexture,
      },
    },
    primitiveType: Engine.PrimitiveType.Triangles,
  });

  floorMeshActor = new MeshActor({
    name: 'floor',
    meshComponent: new MeshComponent({
      geometry: floorGeometry,
      material: floorMaterial,
    }),
  });

  floorMeshActor.addComponent(
    new ScriptComponent({
      updateFunc: function ({ actor, time, deltaTime }) {
        const t = Matrix4.multiplyMatrices(
          Matrix4.createTranslationMatrix(new Vector3(0, -1, 0)),
          Matrix4.createRotationXMatrix((90 * Math.PI) / 180),
          Matrix4.createScalingMatrix(new Vector3(4, 4, 4)),
        );
        actor.worldTransform = t;
      },
    }),
  );

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
      const ratio = Math.min(window.devicePixelRatio, 1.0);

      states.viewportWidth = wrapperElement.offsetWidth;
      states.viewportHeight = wrapperElement.offsetHeight;
      const targetWidth = Math.floor(states.viewportWidth * ratio);
      const targetHeight = Math.floor(states.viewportHeight * ratio);
      canvasElement.width = targetWidth;
      canvasElement.height = targetHeight;

      gpu.setSize(targetWidth, targetHeight);

      actors.forEach((actor) =>
        actor.setSize({ width: targetWidth, height: targetHeight }),
      );

      // perspectiveCamera.updateProjectionMatrix(targetWidth / targetHeight);

      renderTarget.setSize(targetWidth, targetHeight);

      states.isResized = false;
    }
  }

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
    // perspectiveCamera.position.x +=
    //   (targetX - perspectiveCamera.position.x) * dumping;
    // perspectiveCamera.position.y +=
    //   (targetY - perspectiveCamera.position.y) * dumping;
    // perspectiveCamera.position.z = 15;

    perspectiveCameraActor.position.x +=
      (targetX - perspectiveCameraActor.position.x) * dumping;
    perspectiveCameraActor.position.y +=
      (targetY - perspectiveCameraActor.position.y) * dumping;
    perspectiveCameraActor.position.z = 15;

    // const lookAtCameraMatrix = Matrix4.createLookAtCameraMatrix(
    //   perspectiveCamera.position,
    //   new Vector3(0, 0, 0),
    //   new Vector3(0, 1, 0),
    // );
    // perspectiveCamera.cameraMatrix = lookAtCameraMatrix;

    actors.forEach((actor) => actor.update({ time, deltaTime }));
  }

  // render
  {
    const meshActors = actors.filter(
      (actor) => actor.type === Engine.ActorType.MeshActor,
    );

    // const camera = perspectiveCameraActor.camera;

    gpu.flush();

    // renderer.setRenderTarget(renderTarget);
    // renderer.clear();

    renderer.renderScene({ meshActors, cameraActor: perspectiveCameraActor });

    // meshActors.forEach((meshActor, i) => {
    //   // console.log(camera.cameraMatrix.clone());
    //   // console.log(camera.cameraMatrix.clone());

    //   renderer.render({
    //     time,
    //     deltaTime,
    //     // geometry: meshActor.meshComponent.geometry,
    //     // material: meshActor.meshComponent.material,
    //     // modelMatrix: meshActor.worldTransform,
    //     // viewMatrix: perspectiveCamera.cameraMatrix.clone().inverse(),
    //     // projectionMatrix: perspectiveCamera.projectionMatrix,
    //     // normalMatrix: meshActor.worldTransform.clone().inverse().transpose(),
    //     // cameraPosition: perspectiveCamera.cameraMatrix.getTranslationVector(),
    //     geometry: meshActor.meshComponent.geometry,
    //     material: meshActor.meshComponent.material,
    //     modelMatrix: meshActor.worldTransform,
    //     viewMatrix: camera.cameraMatrix.clone().inverse(),
    //     projectionMatrix: camera.projectionMatrix,
    //     normalMatrix: meshActor.worldTransform.clone().inverse().transpose(),
    //     cameraPosition: camera.cameraMatrix.getTranslationVector(),
    //   });
    // });
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
