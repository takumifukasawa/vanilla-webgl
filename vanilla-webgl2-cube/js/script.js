import GPU from './libs/GPU.js';
import Material from './libs/Material.js';
import Geometry from './libs/Geometry.js';
import PerspectiveCamera from './libs/PerspectiveCamera.js';
// import Mesh from './libs/Mesh.js';
import { Matrix4 } from './libs/Matrix.js';
import { Vector3 } from './libs/Vector3.js';
import Actor from './libs/Actor.js';
import MeshComponent from './libs/MeshComponent.js';
import Component from './libs/Component.js';
const wrapperElement = document.querySelector('.js-wrapper');
const canvasElement = document.querySelector('.js-canvas');

const gpu = new GPU({
  canvasElement,
});

const states = {
  isResized: false,
};

const perspectiveCamera = new PerspectiveCamera(0.5, 1, 0.01, 10);

const vertexShader = `#version 300 es

layout (location = 0) in vec3 aPosition;
layout (location = 1) in vec3 aColor;

out vec3 vColor;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

void main() {
  vColor = aColor;
  vec4 pos = uProjectionMatrix * uViewMatrix * uModelMatrix * vec4(aPosition, 1.);
  gl_Position = pos;
}
`;

const fragmentShader = `#version 300 es
precision mediump float;
in vec3 vColor;
out vec4 outColor;
void main() {
  outColor = vec4(vColor, 1);
}
`;

const geometry = new Geometry({
  gpu,
  attributes: {
    aPosition: {
      // prettier-ignore
      data: [
          -0.1, 0.1, -1, // left top
          0.1, 0.1, -1, // right top
          -0.1, -0.1, -1, // left bottom
          0.1, -0.1, -1, // right bottom
        ],
      stride: 3,
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
      type: GPU.UniformTypes.ModelMatrix,
      data: Matrix4.identity,
    },
    uViewMatrix: {
      type: GPU.UniformTypes.ViewMatrix,
    },
    // auto update by renderer
    uProjectionMatrix: {
      type: GPU.UniformTypes.ProjectionMatrix,
    },
  },
});

const planeActor = new Actor();
planeActor.addComponent(
  new MeshComponent({
    geometry,
    material,
  })
);

// const plane = new Mesh({
//   gpu,
//   geometry,
//   material,
// });

const onWindowResize = () => {
  states.isResized = true;
};

const tick = (t) => {
  const time = t / 1000;

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

  gpu.clear(0, 0, 0, 0);

  {
    const cameraTransform = Matrix4.identity();
    cameraTransform.translate(new Vector3(0, 0, 0));
    perspectiveCamera.worldTransform = cameraTransform;

    // const planeTransform = Matrix4.identity();
    // transform.rotateY(time * 0.2);
    // planeTransform.translate(new Vector3(0.1, 0, 0));
    // plane.worldTransform = planeTransform;

    const gl = gpu.getGl();
    gl.enable(gl.DEPTH_TEST);
  }

  // update
  {
    planeActor.update();
  }

  // render
  {
    const meshComponents = planeActor.components.filter(({ type }) => {
      return type === Component.Types.MeshComponent;
    });
    for (let i = 0; i < meshComponents.length; i++) {
      meshComponents[i].render({
        gpu,
        modelMatrix: planeActor.worldTransform,
        viewMatrix: perspectiveCamera.worldTransform.getInvertMatrix(),
        projectionMatrix: perspectiveCamera.projectionMatrix,
      });
    }
  }

  // gpu.draw({ camera: perspectiveCamera, mesh: plane });

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
