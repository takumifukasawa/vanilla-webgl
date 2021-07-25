import GPU from './libs/GPU.js';
import Material from './libs/Material.js';
import Geometry from './libs/Geometry.js';
import Matrix4 from './libs/Matrix4.js';
import Vector3 from './libs/Vector3.js';
import MeshActor from './libs/MeshActor.js';
import CameraActor from './libs/CameraActor.js';
import MeshComponent from './libs/MeshComponent.js';
import ScriptComponent from './libs/ScriptComponent.js';
import PerspectiveCamera from './libs/PerspectiveCamera.js';
import loadObj from './libs/loadObj.js';
import DirectionalLight from './libs/DirectionalLight.js';
// import PointLight from './libs/PointLight.js';
import LightActor from './libs/LightActor.js';
import loadImg from './utils/loadImg.js';
import Texture from './libs/Texture.js';
import CubeMap from './libs/CubeMap.js';
import Attribute from './libs/Attribute.js';
import Renderer from './libs/Renderer.js';
import RenderTarget from './libs/RenderTarget.js';
import Engine from './libs/Engine.js';
import OrthographicCamera from './libs/OrthographicCamera.js';

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

const perspectiveCameraActor = new CameraActor({
  camera: new PerspectiveCamera(0.5, 1, 0.1, 30),
  lookAt: Vector3.zero(),
});

actors.push(perspectiveCameraActor);

const lightActor = new LightActor({
  gpu,
  light: new DirectionalLight({
    color: Vector3.one(),
    position: new Vector3(1, 1, 1),
    intensity: 1,
  }),
  castShadow: true,
});

// for debug
// TODO: light actor の中で update したい
{
  lightActor.position.x = 4;
  lightActor.position.y = 4;
  lightActor.position.z = 4;
  lightActor.worldTransform = Matrix4.multiplyMatrices(
    Matrix4.createTranslationMatrix(lightActor.position),
  );
  // const lookAtCameraMatrix = Matrix4.createLookAtCameraMatrix(
  //   lightActor.position,
  //   new Vector3(0, 0, 0),
  //   new Vector3(0, 1, 0),
  // );
  // lightActor.shadowCamera.cameraMatrix = lookAtCameraMatrix;
}

actors.push(lightActor);

// const orthographicSize = 1;

// const projectorCameraActor = new CameraActor({
//   // camera: new PerspectiveCamera(0.5, 1, 0.1, 50),
//   camera: new OrthographicCamera(
//     -orthographicSize,
//     orthographicSize,
//     -orthographicSize,
//     orthographicSize,
//     0.1,
//     30,
//     1,
//   ),
//   lookAt: Vector3.zero(),
// });
//
// actors.push(projectorCameraActor);

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
// out vec4 vPosition;

void main() {
  vUv = aUv;

  vNormal = (uNormalMatrix * vec4(aNormal, 1.)).xyz;
  vTangent = (uNormalMatrix * vec4(aTangent, 1.)).xyz;
  vBinormal = (uNormalMatrix * vec4(aBinormal, 1.)).xyz;

  vWorldPosition = uModelMatrix * vec4(aPosition, 1.);

  vProjectionUv = uTextureProjectionMatrix * vWorldPosition;

  gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.);

  // gl_Position = vPosition;
}
`;

const fragmentShader = `#version 300 es

precision mediump float;

struct DirectionalLight {
  vec3 position;
  float intensity;
};

uniform DirectionalLight uDirectionalLight;

uniform vec3 uCameraPosition;
uniform sampler2D uBaseColorMap;
uniform sampler2D uNormalMap;
uniform sampler2D uHeightMap;
uniform samplerCube uCubeMap;
uniform sampler2D uUvMap;
uniform sampler2D uDepthMap;

in vec2 vUv;
in vec4 vWorldPosition;
in vec3 vNormal;
in vec3 vTangent;
in vec3 vBinormal;
in vec4 vProjectionUv;
// in vec4 vPosition;

out vec4 outColor;

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

  color += diffuseColor * diffuse * light.intensity;
  color += specularColor * pow(specular, specularPower) * light.intensity;

  return color;
}

void main() {
  vec3 worldPosition = vWorldPosition.xyz;
  vec3 cameraPosition = uCameraPosition;

  vec3 projectionUv = vProjectionUv.xyz / vProjectionUv.w;
  // vec4 projectionTextureColor = texture(uUvMap, projectionUv.xy);
  vec4 projectionTextureColor = texture(uDepthMap, projectionUv.xy);
  float sceneDepth = projectionTextureColor.r;

  float isRange =
    step(0., projectionUv.x) *
    (1. - step(1., projectionUv.x)) *
    step(0., projectionUv.y) *
    (1. - step(1., projectionUv.y));

  // for point light
  // vec3 rawPtoL = uDirectionalLight.position - worldPosition;
  // vec3 PtoL = normalize(rawPtoL);

  // for directional light
  vec3 PtoL = normalize(uDirectionalLight.position); // for directional light

  vec3 PtoE = normalize(cameraPosition - worldPosition);
  vec3 EtoP = -PtoE;
  vec3 H = normalize(PtoL + PtoE);

  float height = texture(uHeightMap, vUv).r;

  float heightRate = .01;

  vec2 offsetUv = ((EtoP.xy) / EtoP.z) * height * heightRate;
  vec2 uv = vUv - offsetUv;

  float normalBlend = .05;

  vec3 normal = normalize(vNormal);
  vec3 tangent = normalize(vTangent);
  vec3 binormal = normalize(vBinormal);

  vec4 nt = texture(uNormalMap, uv) * 2. - 1.;
  vec3 N = mix(
    normal,
    normalize(mat3(tangent, binormal, normal) * nt.xyz),
    normalBlend
  );

  vec3 cubeMapDir = reflect(EtoP, N);
  vec4 envMapColor = texture(uCubeMap, cubeMapDir);

  float diffuse = max(0., dot(PtoL, N));
  float specular = max(0., dot(N, H));

  float specularPower = 8.;

  vec3 diffuseColor = texture(uBaseColorMap, uv).rgb;
  vec3 specularColor = envMapColor.rgb;
  vec3 environmentColor = vec3(.05);

  // for point light
  // float distancePtoL = length(rawPtoL);
  // float attenuation = 1. / (1. + uDirectionalLight.attenuation * distancePtoL * distancePtoL);
  // float attenuation = 1. / (1. +  .2 * distancePtoL * distancePtoL);

  // for directional light
  float attenuation = 1.;

  vec3 color = vec3(0.);

  vec3 lightToSurfaceWorldPosition = (worldPosition.xyz - uDirectionalLight.position);
  float distanceLtoP = length(lightToSurfaceWorldPosition) * (1. / (30. - 0.1));

  float currentDepth = projectionUv.z;
  float isShadow = (currentDepth - .001) >= sceneDepth ? 1. : 0.;

  color += calcDirectionalLight(uDirectionalLight, worldPosition, N, cameraPosition, diffuseColor, specularColor, 8.);
  // color += diffuseColor * diffuse * uDirectionalLight.intensity * attenuation;
  // color += specularColor * pow(specular, specularPower) * uDirectionalLight.intensity * attenuation;
  color = mix(color + environmentColor, environmentColor, isShadow);

  float eta = .67; // 物体の屈折率。ガラス(1 / 1.6)
  float fresnel = ((1. - eta) * (1. - eta)) / ((1. + eta) * (1. + eta)); // フレネル値
  float reflectionRate = fresnel + (1. - fresnel) * pow(1. - dot(PtoE, N), 5.); // 境界面の反射率

  vec3 raDir = refract(normalize(EtoP), normalize(N), .67);
  vec3 raColor = texture(uCubeMap, raDir).rgb;

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
  // const data = await loadObj('./model/sphere-32x32.obj');
  const data = await loadObj('./model/cube.obj');

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
    ['uDirectionalLight.position']: {
      type: Engine.UniformType.Vector3f,
      // data: lightActor.light.position,
      data: lightActor.position,
    },
    ['uDirectionalLight.intensity']: {
      type: Engine.UniformType.Float,
      data: lightActor.light.intensity,
    },
    // ['uDirectionalLight.attenuation']: {
    //   type: Engine.UniformType.Float,
    //   data: lightActor.light.attenuation,
    // },
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
    uUvMap: {
      type: Engine.UniformType.Texture2D,
      data: uvMapTexture,
    },
    uTextureProjectionMatrix: {
      type: Engine.UniformType.Matrix4fv,
      data: Matrix4.identity(),
    },
    uDepthMap: {
      type: Engine.UniformType.Texture2D,
      data: lightActor.shadowMap.depthTexture,
    },
  };

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
    vertexShader,
    fragmentShader,
    uniforms,
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
        // const t = Matrix4.multiplyMatrices(
        //   Matrix4.createRotationYMatrix(time * 0.3),
        //   Matrix4.createRotationXMatrix(time * 0.4),
        //   Matrix4.createRotationZMatrix(time * 0.5),
        // );
        // actor.worldTransform = t;
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
      {
        type: Engine.AttributeType.Normal,
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

    // projectorCameraActor.position.x = 1.2;
    // projectorCameraActor.position.y = 1.2;
    // projectorCameraActor.position.z = 1.2;

    // projectorCameraActor.lookAt = new Vector3(0, 0.5, 0);

    // // prettier-ignore
    // const textureMatrix = new Matrix4(
    //   0.5, 0, 0, 0,
    //   0, 0.5, 0, 0,
    //   0, 0, 1, 0,
    //   0.5, 0.5, 0, 1
    // );
    // const textureProjectionMatrix = Matrix4.multiplyMatrices(
    //   textureMatrix,
    //   projectorCameraActor.camera.projectionMatrix.clone(),
    //   projectorCameraActor.camera.cameraMatrix.clone().inverse(),
    // );

    // objMeshActor.getMaterial().uniforms.uTextureProjectionMatrix.data =
    //   textureProjectionMatrix;
    // floorMeshActor.getMaterial().uniforms.uTextureProjectionMatrix.data =
    //   textureProjectionMatrix;

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

    const lightActors = actors.filter(
      (actor) => actor.type === Engine.ActorType.LightActor,
    );

    // const camera = perspectiveCameraActor.camera;

    gpu.flush();

    // renderer.setRenderTarget(renderTarget);
    // renderer.clear();

    renderer.renderScene({
      meshActors,
      lightActors,
      cameraActor: perspectiveCameraActor,
    });

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
