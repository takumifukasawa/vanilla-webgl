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
import loadImg from './utils/loadImg.js';
import Texture from './libs/Texture.js';
import CubeMap from './libs/CubeMap.js';

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

const perspectiveCamera = new PerspectiveCamera(0.5, 1, 0.1, 50);

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

  outColor = vec4(color, 1.);
}
`;

const init = async () => {
  const data = await loadObj('./model/sphere-32x32.obj');

  const [baseColorMapImg, normalMapImg, heightMapImg, ...cubeMapImages] =
    await Promise.all([
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

  const baseColorMapTexture = new Texture({ gpu, img: baseColorMapImg });

  const normalMapTexture = new Texture({ gpu, img: normalMapImg });

  const heightMapTexture = new Texture({ gpu, img: heightMapImg });

  const cubeMapTexture = new CubeMap({ gpu, images: cubeMapImages });

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
    fragmentShader: fragmentShader,
    uniforms: {
      uModelMatrix: {
        type: GPU.UniformTypes.Matrix4fv,
        data: Matrix4.identity().getArray(),
      },
      uInvModelMatrix: {
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
      uCameraPosition: {
        type: GPU.UniformTypes.Vector3f,
        data: Vector3.one().getArray(),
      },
      uBaseColorMap: {
        type: GPU.UniformTypes.Texture2D,
        data: baseColorMapTexture,
      },
      uNormalMap: {
        type: GPU.UniformTypes.Texture2D,
        data: normalMapTexture,
      },
      uHeightMap: {
        type: GPU.UniformTypes.Texture2D,
        data: heightMapTexture,
      },
      uCubeMap: {
        type: GPU.UniformTypes.CubeMap,
        data: cubeMapTexture,
      },
    },
    primitiveType: GPU.Primitives.Triangle,
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
          -3, 0, -3,
          3, 0, -3,
          -3, 0, 3,
          3, 0, 3,
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
          0, 1, 0,
          0, 1, 0,
          0, 1, 0,
          0, 1, 0,
        ],
        stride: 3,
      },
    },
    indices: [0, 2, 1, 1, 2, 3],
  });

  const floorMaterial = new Material({
    gpu,
    vertexShader: baseVertexShader,
    fragmentShader: fragmentShader,
    uniforms: {
      uModelMatrix: {
        type: GPU.UniformTypes.Matrix4fv,
        data: Matrix4.identity().getArray(),
      },
      uInvModelMatrix: {
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
      uCameraPosition: {
        type: GPU.UniformTypes.Vector3f,
        data: Vector3.one().getArray(),
      },
      uBaseColorMap: {
        type: GPU.UniformTypes.Texture2D,
        data: baseColorMapTexture,
      },
      uNormalMap: {
        type: GPU.UniformTypes.Texture2D,
        data: normalMapTexture,
      },
      uHeightMap: {
        type: GPU.UniformTypes.Texture2D,
        data: heightMapTexture,
      },
      uCubeMap: {
        type: GPU.UniformTypes.CubeMap,
        data: cubeMapTexture,
      },
    },
    primitiveType: GPU.Primitives.Triangles,
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
          Matrix4.createTranslationMatrix(new Vector3(0, -1.5, 0)),
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
  cameraPosition,
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
          gl.ONE,
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
    cameraPosition,
  });

  gpu.setShader(material.shader);
  gpu.setVertex(geometry.vao);
  // gpu.setAttributes(geometry.attributes);
  // gpu.setTextures(material.textures);
  gpu.setUniforms(material.uniforms);
  // TODO: primitiveの種別とindicesがあるかないかで判断するのが正しい
  if (material.primitiveType === GPU.Primitives.Points) {
    gpu.draw(
      geometry.attributes.aPosition.data.length / 3,
      material.primitiveType,
    );
  } else {
    if (geometry.indices) {
      gpu.setIndices(geometry.indices);
      gpu.draw(geometry.indices.length, material.primitiveType);
    } else {
      // TODO: attributeのvertexにtypeをもたせる
      gpu.draw(geometry.attributes[0].data.length / 3, material.primitiveType);
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
    perspectiveCamera.position.z = 15;
    const lookAtCameraMatrix = Matrix4.createLookAtCameraMatrix(
      perspectiveCamera.position,
      new Vector3(0, 0, 0),
      new Vector3(0, 1, 0),
    );
    perspectiveCamera.cameraMatrix = lookAtCameraMatrix;

    actors.forEach((actor) => actor.update({ time, deltaTime }));
  }

  // render
  {
    const meshActors = actors.filter(
      (actor) => actor.type === Actor.Types.MeshActor,
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
        // normalMatrix: meshActor.worldTransform.clone().transpose().inverse(),
        cameraPosition: perspectiveCamera.cameraMatrix.getTranslationVector(),
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
