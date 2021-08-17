import Camera from './Camera.js';
import { CameraType } from './Constants.js';
import Matrix4 from './Matrix4.js';

export default class OrthographicCamera extends Camera {
  #left;
  #right;
  #bottom;
  #top;
  #nearClip;
  #farClip;
  #orthographicSize;

  get left() {
    return this.#left;
  }

  get right() {
    return this.#right;
  }

  get bottom() {
    return this.#bottom;
  }

  get top() {
    return this.#top;
  }

  get nearClip() {
    return this.#nearClip;
  }

  get farClip() {
    return this.#farClip;
  }

  get orthographicSize() {
    return this.#orthographicSize;
  }

  constructor(
    left = -1,
    right = 1,
    bottom = -1,
    top = 1,
    nearClip = 0.1,
    farClip = 50,
  ) {
    super({ type: CameraType.OrthographicCamera });
    this.#left = left;
    this.#right = right;
    this.#bottom = bottom;
    this.#top = top;
    this.#nearClip = nearClip;
    this.#farClip = farClip;
    this.cameraMatrix = Matrix4.identity();
    this.projectionMatrix = Matrix4.identity();
    this.updateProjectionMatrix(this.left, this.right, this.bottom, this.top);
  }

  setParams({ left, right, bottom, top, orthographicSize }) {
    if (left) {
      this.#left = left;
    }
    if (right) {
      this.#right = right;
    }
    if (bottom) {
      this.#bottom = bottom;
    }
    if (top) {
      this.#top = top;
    }
    if (orthographicSize) {
      this.#orthographicSize = orthographicSize;
    }
  }

  // aspect: w / h
  updateProjectionMatrix(args = {}) {
    if (args) {
      this.setParams(args);
    }
    if (this.#orthographicSize) {
      this.projectionMatrix = Matrix4.getOrthographicMatrix(
        -this.#orthographicSize,
        this.#orthographicSize,
        -this.#orthographicSize,
        this.#orthographicSize,
        this.#nearClip,
        this.#farClip,
      );
      return;
    }
    this.projectionMatrix = Matrix4.getOrthographicMatrix(
      this.#left,
      this.#right,
      this.#bottom,
      this.#top,
      this.#nearClip,
      this.#farClip,
    );
  }
}
