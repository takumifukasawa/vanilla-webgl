import GPU from './libs/GPU.js';
import Material from './libs/Material.js';
import Geometry from './libs/Geometry.js';
import Matrix4 from './libs/Matrix4.js';
import Vector3 from './libs/Vector3.js';
import MeshActor from './libs/MeshActor.js';
import CameraActor from './libs/CameraActor.js';
import ScriptComponent from './libs/ScriptComponent.js';
import PerspectiveCamera from './libs/PerspectiveCamera.js';
import OrthographicCamera from './libs/OrthographicCamera.js';
import loadObj from './libs/loadObj.js';
import DirectionalLight from './libs/DirectionalLight.js';
import PointLight from './libs/PointLight.js';
import LightActor from './libs/LightActor.js';
import loadImg from './utils/loadImg.js';
import Texture from './libs/Texture.js';
import CubeMap from './libs/CubeMap.js';
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

const debugValues = {
  depthBias: -0.00195,
  normalBlendRate: 0.2,
  // for directional light
  shadowOrthographicSize: 4,
  // for point light
  // shadowPerspectiveFov: 90,
  // shadowPerspectiveAspect: 1,
};

GUIDebugger.addRange({
  name: 'depthBias',
  min: -0.005,
  max: -0.00001,
  step: 0.00001,
  initialValue: debugValues.depthBias,
  onInput: (value) => {
    debugValues.depthBias = value;
  },
});

GUIDebugger.addRange({
  name: 'normalBlendRate',
  min: 0,
  max: 1,
  step: 0.01,
  initialValue: debugValues.normalBlendRate,
  onInput: (value) => {
    debugValues.normalBlendRate = value;
  },
});

GUIDebugger.addRange({
  name: 'shadowOrthographicSize',
  min: 0.1,
  max: 180,
  step: 0.1,
  initialValue: debugValues.shadowOrthographicSize,
  onInput: (value) => {
    debugValues.shadowOrthographicSize = value;
  },
});

// for point light
// GUIDebugger.addRange({
//   name: 'shadowPerspectiveFov',
//   min: 0.1,
//   max: 180,
//   step: 0.1,
//   initialValue: debugValues.shadowPerspectiveFov,
//   onInput: (value) => {
//     debugValues.shadowPerspectiveFov = value;
//   },
// });
//
// GUIDebugger.addRange({
//   name: 'shadowPerspectiveAspect',
//   min: 0.1,
//   max: 10,
//   step: 0.01,
//   initialValue: debugValues.shadowPerspectiveAspect,
//   onInput: (value) => {
//     debugValues.shadowPerspectiveAspect = value;
//   },
// });

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

let cubeMeshActor;
let sphereMeshActor;
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
        // actor.worldTransform = Matrix4.multiplyMatrices(
        //   Matrix4.createTranslationMatrix(actor.position),
        // );
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
  // light: new PointLight({
  //   color: new Vector3(1, 1, 1),
  //   intensity: 8,
  //   attenuation: 0.2,
  // }),
  castShadow: true,
  shadowMapWidth: 1024,
  shadowMapHeight: 1024,
  components: [
    new ScriptComponent({
      startFunc: ({ actor }) => {
        actor.setPosition(new Vector3(4, 4, 4));
        // actor.worldTransform = Matrix4.multiplyMatrices(
        //   Matrix4.createTranslationMatrix(actor.position),
        // );
      },
      updateFunc: ({ actor }) => {
        // for directional light
        actor.shadowCamera.updateProjectionMatrix({
          orthographicSize: debugValues.shadowOrthographicSize,
        });
      },
    }),
  ],
});

actors.push(lightActor);

const vertexShader = `#version 300 es

layout (location = 0) in vec3 aPosition;
layout (location = 1) in vec2 aUv;
layout (location = 2) in vec3 aNormal;
layout (location = 3) in vec3 aTangent;
layout (location = 4) in vec3 aBinormal;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;
uniform mat4 uNormalMatrix;
uniform mat4 uTextureProjectionMatrix;

out vec2 vUv;
out vec4 vWorldPosition;
out vec3 vNormal;
out vec3 vTangent;
out vec3 vBinormal;
out vec4 vProjectionUv;

void main() {
  vUv = aUv;

  vNormal = (uNormalMatrix * vec4(aNormal, 1.)).xyz;
  vTangent = (uNormalMatrix * vec4(aTangent, 1.)).xyz;
  vBinormal = (uNormalMatrix * vec4(aBinormal, 1.)).xyz;

  vWorldPosition = uModelMatrix * vec4(aPosition, 1.);

  vProjectionUv = uTextureProjectionMatrix * vWorldPosition;

  gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.);
}
`;

const fragmentShader = `#version 300 es

precision mediump float;

struct DirectionalLight {
  vec3 position;
  vec3 color;
  float intensity;
};

struct PointLight {
  vec3 position;
  vec3 color;
  float intensity;
  float attenuation;
};

// for directional light
uniform DirectionalLight uLight;

// for point light
// uniform PointLight uLight;

uniform vec3 uCameraPosition;
uniform sampler2D uBaseColorMap;
uniform sampler2D uNormalMap;
uniform sampler2D uHeightMap;
uniform samplerCube uCubeMap;
uniform sampler2D uUvMap;
uniform sampler2D uDepthMap;
uniform float uDepthBias;
uniform float uNormalBlendRate;

in vec2 vUv;
in vec4 vWorldPosition;
in vec3 vNormal;
in vec3 vTangent;
in vec3 vBinormal;
in vec4 vProjectionUv;

out vec4 outColor;

vec3 calcNormalMapDir(
  vec3 normal,
  vec3 tangent,
  vec3 binormal,
  sampler2D normalMap,
  vec2 uv
) {
  vec4 nt = texture(normalMap, uv) * 2. - 1.;
  return normalize(mat3(tangent, binormal, normal) * nt.xyz);
}

vec3 calcParallaxMappingNormalDir(
  vec3 normal,
  vec3 tangent,
  vec3 binormal,
  sampler2D normalMap,
  sampler2D heightMap,
  vec2 uv,
  vec3 EtoP,
  float heightRate
) {
  float height = texture(heightMap, uv).r;

  vec2 offsetUv = ((EtoP.xy) / EtoP.z) * height * heightRate;

  vec4 nt = texture(normalMap, uv - offsetUv) * 2. - 1.;

  return normalize(mat3(tangent, binormal, normal) * nt.xyz);
}

vec3 calcDirectionalLight(
  DirectionalLight light,
  vec3 position,
  vec3 normal,
  vec3 cameraPosition,
  vec3 diffuseColor,
  vec3 specularColor,
  float specularPower
) {
  vec3 PtoL = normalize(light.position);

  vec3 PtoE = normalize(cameraPosition - position);
  vec3 EtoP = -PtoE;
  vec3 H = normalize(PtoL + PtoE);

  float diffuse = max(0., dot(PtoL, normal));
  float specular = max(0., dot(normal, H));

  vec3 color = vec3(0.);

  color += diffuseColor * diffuse * light.color * light.intensity;
  color += specularColor * pow(specular, specularPower) * light.color * light.intensity;

  return color;
}

vec3 calcPointLight(
  PointLight light,
  vec3 position,
  vec3 normal,
  vec3 cameraPosition,
  vec3 diffuseColor,
  vec3 specularColor,
  float specularPower
) {
  vec3 rawPtoL = light.position - position;
  vec3 PtoL = normalize(rawPtoL);

  vec3 PtoE = normalize(cameraPosition - position);
  vec3 EtoP = -PtoE;
  vec3 H = normalize(PtoL + PtoE);

  float diffuse = max(0., dot(PtoL, normal));
  float specular = max(0., dot(normal, H));

  // for point light
  float distancePtoL = length(rawPtoL);
  // float attenuation = 1. / (1. + light.attenuation * distancePtoL * distancePtoL);
  float attenuation = 1. / (1. +  .2 * distancePtoL * distancePtoL);

  vec3 color = vec3(0.);

  color += diffuseColor * diffuse * light.color * light.intensity * attenuation;
  color += specularColor * pow(specular, specularPower) * light.color * light.intensity * attenuation;

  return color;
}

float calcShadow(sampler2D depthMap, vec4 shadowMapUv) {
  vec3 projectionUv = shadowMapUv.xyz / shadowMapUv.w;
  vec4 projectionTextureColor = texture(depthMap, projectionUv.xy);
  float sceneDepth = projectionTextureColor.r;

  float currentDepth = projectionUv.z;
  // float isShadow = (currentDepth + uDepthBias) >= sceneDepth ? 1. : 0.;
  float isShadow = smoothstep(sceneDepth, currentDepth + uDepthBias, 1.);

  float isRange =
    step(0., projectionUv.x) *
    (1. - step(1., projectionUv.x)) *
    step(0., projectionUv.y) *
    (1. - step(1., projectionUv.y));

  return isShadow * isRange;
}

void main() {
  vec3 worldPosition = vWorldPosition.xyz;
  vec3 cameraPosition = uCameraPosition;

  vec3 PtoE = normalize(cameraPosition - worldPosition);
  vec3 EtoP = -PtoE;

  vec3 normal = normalize(vNormal);
  vec3 tangent = normalize(vTangent);
  vec3 binormal = normalize(vBinormal);

  vec3 normalMapDir = calcNormalMapDir(
    normal,
    tangent,
    binormal,
    uNormalMap,
    vUv
  );

  vec3 parallaxMappingNormalDir = calcParallaxMappingNormalDir(
    normal,
    tangent,
    binormal,
    uNormalMap,
    uHeightMap,
    vUv,
    EtoP,
    .01
  );

  // blend normal
  vec3 N = normalize(mix(normalMapDir, parallaxMappingNormalDir, uNormalBlendRate));

  float isShadow = calcShadow(uDepthMap, vProjectionUv);

  vec3 cubeMapDir = reflect(EtoP, N);
  vec4 envMapColor = texture(uCubeMap, cubeMapDir);

  vec3 diffuseColor = texture(uBaseColorMap, vUv).rgb;
  vec3 specularColor = envMapColor.rgb;
  vec3 environmentColor = vec3(.05);

  vec3 color = vec3(0.);

  // tmp
  // vec3 lightToSurfaceWorldPosition = (worldPosition.xyz - uLight.position);
  // float distanceLtoP = length(lightToSurfaceWorldPosition) * (1. / (30. - 0.1));

  color += calcDirectionalLight(uLight, worldPosition, N, cameraPosition, diffuseColor, specularColor, 8.);
  // color += calcPointLight(uLight, worldPosition, N, cameraPosition, diffuseColor, specularColor, 8.);

  color = mix(color + environmentColor, environmentColor, isShadow);

  // tmp
  // float eta = .67; // 物体の屈折率。ガラス(1 / 1.6)
  // float fresnel = ((1. - eta) * (1. - eta)) / ((1. + eta) * (1. + eta)); // フレネル値
  // float reflectionRate = fresnel + (1. - fresnel) * pow(1. - dot(PtoE, N), 5.); // 境界面の反射率
  // vec3 raDir = refract(normalize(EtoP), normalize(N), .67);
  // vec3 raColor = texture(uCubeMap, raDir).rgb;

  // for debug
  // color = mix(envMapColor.rgb, raColor, reflectionRate);
  // color = mix(
  //   vec3(1., 0., 0.),
  //   vec3(0., 0., 1.),
  //   isShadow
  // );

  outColor = vec4(color, 1.);
}
`;

const init = async () => {
  const cubeData = await loadObj('./model/cube.obj');
  const sphereData = await loadObj('./model/sphere-32x32.obj');

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

  const uniforms = {
    ['uLight.position']: {
      type: UniformType.Vector3f,
      data: lightActor.position,
    },
    ['uLight.color']: {
      type: UniformType.Vector3f,
      data: lightActor.light.color,
    },
    ['uLight.intensity']: {
      type: UniformType.Float,
      data: lightActor.light.intensity,
    },
    ['uLight.attenuation']: {
      type: UniformType.Float,
      data: lightActor.light.attenuation,
    },
    uBaseColorMap: {
      type: UniformType.Texture2D,
      data: baseColorMapTexture,
    },
    uNormalMap: {
      type: UniformType.Texture2D,
      data: normalMapTexture,
    },
    uHeightMap: {
      type: UniformType.Texture2D,
      data: heightMapTexture,
    },
    uCubeMap: {
      type: UniformType.CubeMap,
      data: cubeMapTexture,
    },
    uUvMap: {
      type: UniformType.Texture2D,
      data: uvMapTexture,
    },
    uTextureProjectionMatrix: {
      type: UniformType.Matrix4fv,
      data: Matrix4.identity(),
    },
    uDepthMap: {
      type: UniformType.Texture2D,
      data: lightActor.shadowMap.depthTexture,
    },
    uDepthBias: {
      type: UniformType.Float,
      data: debugValues.depthBias,
    },
    uNormalBlendRate: {
      type: UniformType.Float,
      data: debugValues.normalBlendRate,
    },
  };

  const syncValueComponent = new ScriptComponent({
    updateFunc: ({ actor }) => {
      // NOTE: 多分いらない
      if (!actor.isType(ActorType.MeshActor)) {
        return;
      }

      actor.material.uniforms.uDepthBias.data = debugValues.depthBias;
      actor.material.uniforms.uNormalBlendRate.data =
        debugValues.normalBlendRate;

      // TODO: renderer側で更新したい
      actor.material.uniforms['uLight.position'].data = lightActor.position;
      actor.material.uniforms['uLight.color'].data = lightActor.light.color;
      actor.material.uniforms['uLight.intensity'].data =
        lightActor.light.intensity;
      actor.material.uniforms['uLight.attenuation'].data =
        lightActor.light.attenuation;
    },
  });

  // cube

  const cubeGeometry = new Geometry({
    gpu,
    attributes: [
      {
        type: AttributeType.Position,
        data: cubeData.positions,
        stride: 3,
      },
      {
        type: AttributeType.Uv,
        data: cubeData.uvs,
        stride: 2,
      },
      {
        type: AttributeType.Normal,
        data: cubeData.normals,
        stride: 3,
      },
      Attribute.createTangent(cubeData.normals),
      Attribute.createBinormal(cubeData.normals),
    ],
  });

  const cubeMaterial = new Material({
    gpu,
    vertexShader,
    fragmentShader,
    uniforms,
    primitiveType: PrimitiveType.Triangle,
  });

  cubeMeshActor = new MeshActor({
    name: 'cubeMesh',
    geometry: cubeGeometry,
    material: cubeMaterial,
    components: [
      new ScriptComponent({
        updateFunc: function ({ actor, time, deltaTime }) {
          // const t = Matrix4.multiplyMatrices(
          //   Matrix4.createRotationYMatrix(time * 0.3),
          //   Matrix4.createRotationXMatrix(time * 0.4),
          //   Matrix4.createRotationZMatrix(time * 0.5),
          // );
          // actor.worldTransform = t;
          actor.setPosition(new Vector3(-1, 0, 0));
          // actor.worldTransform = t;
        },
      }),
      syncValueComponent.clone(),
    ],
  });

  actors.push(cubeMeshActor);

  // sphere

  const sphereGeometry = new Geometry({
    gpu,
    attributes: [
      {
        type: AttributeType.Position,
        data: sphereData.positions,
        stride: 3,
      },
      {
        type: AttributeType.Uv,
        data: sphereData.uvs,
        stride: 2,
      },
      {
        type: AttributeType.Normal,
        data: sphereData.normals,
        stride: 3,
      },
      Attribute.createTangent(sphereData.normals),
      Attribute.createBinormal(sphereData.normals),
    ],
  });

  const sphereMaterial = new Material({
    gpu,
    vertexShader,
    fragmentShader,
    uniforms,
    primitiveType: PrimitiveType.Triangle,
  });

  sphereMeshActor = new MeshActor({
    name: 'sphereMesh',
    geometry: sphereGeometry,
    material: sphereMaterial,
    components: [
      new ScriptComponent({
        updateFunc: function ({ actor, time, deltaTime }) {
          // const t = Matrix4.multiplyMatrices(
          //   Matrix4.createTranslationMatrix(new Vector3(1.5, 1, 1)),
          // );
          // actor.worldTransform = t;
          actor.setPosition(new Vector3(1.5, 1, 1));
        },
      }),
      syncValueComponent.clone(),
    ],
  });

  actors.push(sphereMeshActor);

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
      {
        type: AttributeType.Position,
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
        type: AttributeType.Uv,
        // prettier-ignore
        data: [
          0, 0,
          1, 0,
          1, 1,
          0, 1,
        ],
        stride: 2,
      },
      {
        type: AttributeType.Normal,
        data: floorNormals,
        stride: 3,
      },
      Attribute.createTangent(floorNormals),
      Attribute.createBinormal(floorNormals),
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
          // const t = Matrix4.multiplyMatrices(
          //   Matrix4.createTranslationMatrix(new Vector3(0, -1, 0)),
          //   Matrix4.createRotationXMatrix((90 * Math.PI) / 180),
          //   Matrix4.createScalingMatrix(new Vector3(4, 4, 4)),
          // );
          // actor.worldTransform = t;
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
    actors.forEach((actor) => {
      if (actor.type === ActorType.LightActor) {
        // console.log('hoge');
      }
    });
    actors.forEach((actor) => actor.update({ time, deltaTime }));
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
