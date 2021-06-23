import { Vector3 } from './Vector3.js';

export class Matrix4 {
  // prettier-ignore
  constructor(
    m00, m01, m02, m03,
    m10, m11, m12, m13,
    m20, m21, m22, m23,
    m30, m31, m32, m33
  ) {
    this.m00 = m00;
    this.m01 = m01;
    this.m02 = m02;
    this.m03 = m03;
    this.m10 = m10;
    this.m11 = m11;
    this.m12 = m12;
    this.m13 = m13;
    this.m20 = m20;
    this.m21 = m21;
    this.m22 = m22;
    this.m23 = m23;
    this.m30 = m30;
    this.m31 = m31;
    this.m32 = m32;
    this.m33 = m33;
  }

  static zero() {
    // prettier-ignore
    return new Matrix4(
      0, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0
    );
  }

  static identity() {
    // prettier-ignore
    return new Matrix4(
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    );
  }

  static createTranslateMatrix(v) {
    // prettier-ignore
    return new Matrix4(
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      v.x, v.y, v.z, 1
    );
  }

  static createRotateXMatrix(rad) {
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    // prettier-ignore
    return new Matrix4(
      1, 0, 0, 0,
      0, c, -s, 0,
      0, s, c, 0,
      0, 0, 0, 1
    );
  }
  static createRotateYMatrix(rad) {
    // const c = Math.cos(rad);
    // const s = Math.sin(rad);
    // // prettier-ignore
    // return new Matrix4(
    //   c, 0, -s, 0,
    //   0, 1, 0, 0,
    //   s, 0, c, 0,
    //   0, 0, 0, 1
    // );

    // prettier-ignore
    return new Matrix4(
      Math.cos(rad), 0, -Math.sin(rad), 0,
      0, 1, 0, 0,
      Math.sin(rad), 0, Math.cos(rad), 0,
      0, 0, 0, 1,
    );
  }

  static createRotateZMatrix(rad) {
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    // prettier-ignore
    return new Matrix4(
      c, -s, 0, 0,
      s, c, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    );
  }

  static createScaleMatrix(s) {
    // prettier-ignore
    return new Matrix4(
      s.x, 0, 0, 0,
      0, s.y, 0, 0,
      0, 0, s.z, 0,
      0, 0, 0, 1
    );
  }

  // 右手座標系での方向ベクトル
  // inverseされることでviewMatrixとして使う
  static createLookAtCameraMatrix(eye, center, up) {
    // f: 実際のforwardとは逆なことに注意. inverseされるため
    const f = Vector3.subVectors(eye, center).normalize();
    const r = Vector3.crossVectors(up.normalize(), f).normalize();
    const u = Vector3.crossVectors(f, r);
    // prettier-ignore
    return new Matrix4(
      r.x, r.y, r.z, 0,
      u.x, u.y, u.z, 0,
      f.x, f.y, f.z, 0,
      eye.x, eye.y, eye.z, 1
    );
  }

  getArray() {
    // prettier-ignore
    return [
      this.m00, this.m01, this.m02, this.m03,
      this.m10, this.m11, this.m12, this.m13,
      this.m20, this.m21, this.m22, this.m23,
      this.m30, this.m31, this.m32, this.m33
    ];
  }

  static cloneMatrix(m) {
    // prettier-ignore
    return new Matrix4(
      m.m00, m.m01, m.m02, m.m03,
      m.m10, m.m11, m.m12, m.m13,
      m.m20, m.m21, m.m22, m.m23,
      m.m30, m.m31, m.m32, m.m33
    );
  }

  copyFromMatrix(m) {
    this.m00 = m.m00;
    this.m01 = m.m01;
    this.m02 = m.m02;
    this.m03 = m.m03;
    this.m10 = m.m10;
    this.m11 = m.m11;
    this.m12 = m.m12;
    this.m13 = m.m13;
    this.m20 = m.m20;
    this.m21 = m.m21;
    this.m22 = m.m22;
    this.m23 = m.m23;
    this.m30 = m.m30;
    this.m31 = m.m31;
    this.m32 = m.m32;
    this.m33 = m.m33;
    return this;
  }

  copyToMatrix(m) {
    m.m00 = this.m00;
    m.m01 = this.m01;
    m.m02 = this.m02;
    m.m03 = this.m03;
    m.m10 = this.m10;
    m.m11 = this.m11;
    m.m12 = this.m12;
    m.m13 = this.m13;
    m.m20 = this.m20;
    m.m21 = this.m21;
    m.m22 = this.m22;
    m.m23 = this.m23;
    m.m30 = this.m30;
    m.m31 = this.m31;
    m.m32 = this.m32;
    m.m33 = this.m33;
    return m;
  }

  static multiplyMatrices(a, b) {
    const out = Matrix4.identity();

    out.m00 = b.m00 * a.m00 + b.m10 * a.m01 + b.m20 * a.m02 + b.m30 * a.m03;
    out.m10 = b.m00 * a.m10 + b.m10 * a.m11 + b.m20 * a.m12 + b.m30 * a.m13;
    out.m20 = b.m00 * a.m20 + b.m10 * a.m21 + b.m20 * a.m22 + b.m30 * a.m23;
    out.m30 = b.m00 * a.m30 + b.m10 * a.m31 + b.m20 * a.m32 + b.m30 * a.m33;

    out.m01 = b.m01 * a.m00 + b.m11 * a.m01 + b.m21 * a.m02 + b.m31 * a.m03;
    out.m11 = b.m01 * a.m10 + b.m11 * a.m11 + b.m21 * a.m12 + b.m31 * a.m13;
    out.m21 = b.m01 * a.m20 + b.m11 * a.m21 + b.m21 * a.m22 + b.m31 * a.m23;
    out.m31 = b.m01 * a.m30 + b.m11 * a.m31 + b.m21 * a.m32 + b.m31 * a.m33;

    out.m02 = b.m02 * a.m00 + b.m12 * a.m01 + b.m22 * a.m02 + b.m32 * a.m03;
    out.m12 = b.m02 * a.m10 + b.m12 * a.m11 + b.m22 * a.m12 + b.m32 * a.m13;
    out.m22 = b.m02 * a.m20 + b.m12 * a.m21 + b.m22 * a.m22 + b.m32 * a.m23;
    out.m32 = b.m02 * a.m30 + b.m12 * a.m31 + b.m22 * a.m32 + b.m32 * a.m33;

    out.m03 = b.m03 * a.m00 + b.m13 * a.m01 + b.m23 * a.m02 + b.m33 * a.m03;
    out.m13 = b.m03 * a.m10 + b.m13 * a.m11 + b.m23 * a.m12 + b.m33 * a.m13;
    out.m23 = b.m03 * a.m20 + b.m13 * a.m21 + b.m23 * a.m22 + b.m33 * a.m23;
    out.m33 = b.m03 * a.m30 + b.m13 * a.m31 + b.m23 * a.m32 + b.m33 * a.m33;

    return out;
  }

  // 後ろからかけていく
  static postMultiplyMatrices(...matrices) {
    let m = Matrix4.identity();
    for (let i = matrices.length - 1; i >= 0; i--) {
      m.postMultiplyMatrix(matrices[i]);
    }
    return m;
  }

  // 後ろからかける
  // 計算方法を統一したいのでcopyを使う
  postMultiplyMatrix(m) {
    this.copyFromMatrix(Matrix4.multiplyMatrices(this, m));
    return this;
  }

  translate(v) {
    this.m30 += v.x;
    this.m31 += v.y;
    this.m32 += v.z;
    return this;
  }

  rotateX(rad) {
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    this.m11 = c;
    this.m12 = -s;
    this.m21 = s;
    this.m22 = c;
  }

  rotateY(rad) {
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    this.m00 = c;
    this.m02 = -s;
    this.m20 = s;
    this.m22 = c;
  }

  rotateZ(rad) {
    const c = Math.cos(rad);
    const s = Math.sin(rad);
    this.m00 = c;
    this.m01 = -s;
    this.m10 = s;
    this.m11 = c;
  }

  // ref: https://github.com/gregtatum/mdn-model-view-projection/blob/master/shared/matrices.js
  getInvertMatrix() {
    // Adapted from: https://github.com/mrdoob/three.js/blob/master/src/math/Matrix4.js

    // Performance note: Try not to allocate memory during a loop. This is done here
    // for the ease of understanding the code samples.
    const result = [];

    const n11 = this.m00,
      n12 = this.m10,
      n13 = this.m20,
      n14 = this.m30;
    const n21 = this.m01,
      n22 = this.m11,
      n23 = this.m21,
      n24 = this.m31;
    const n31 = this.m02,
      n32 = this.m12,
      n33 = this.m22,
      n34 = this.m32;
    const n41 = this.m03,
      n42 = this.m13,
      n43 = this.m23,
      n44 = this.m33;

    result[0] =
      n23 * n34 * n42 -
      n24 * n33 * n42 +
      n24 * n32 * n43 -
      n22 * n34 * n43 -
      n23 * n32 * n44 +
      n22 * n33 * n44;
    result[4] =
      n14 * n33 * n42 -
      n13 * n34 * n42 -
      n14 * n32 * n43 +
      n12 * n34 * n43 +
      n13 * n32 * n44 -
      n12 * n33 * n44;
    result[8] =
      n13 * n24 * n42 -
      n14 * n23 * n42 +
      n14 * n22 * n43 -
      n12 * n24 * n43 -
      n13 * n22 * n44 +
      n12 * n23 * n44;
    result[12] =
      n14 * n23 * n32 -
      n13 * n24 * n32 -
      n14 * n22 * n33 +
      n12 * n24 * n33 +
      n13 * n22 * n34 -
      n12 * n23 * n34;
    result[1] =
      n24 * n33 * n41 -
      n23 * n34 * n41 -
      n24 * n31 * n43 +
      n21 * n34 * n43 +
      n23 * n31 * n44 -
      n21 * n33 * n44;
    result[5] =
      n13 * n34 * n41 -
      n14 * n33 * n41 +
      n14 * n31 * n43 -
      n11 * n34 * n43 -
      n13 * n31 * n44 +
      n11 * n33 * n44;
    result[9] =
      n14 * n23 * n41 -
      n13 * n24 * n41 -
      n14 * n21 * n43 +
      n11 * n24 * n43 +
      n13 * n21 * n44 -
      n11 * n23 * n44;
    result[13] =
      n13 * n24 * n31 -
      n14 * n23 * n31 +
      n14 * n21 * n33 -
      n11 * n24 * n33 -
      n13 * n21 * n34 +
      n11 * n23 * n34;
    result[2] =
      n22 * n34 * n41 -
      n24 * n32 * n41 +
      n24 * n31 * n42 -
      n21 * n34 * n42 -
      n22 * n31 * n44 +
      n21 * n32 * n44;
    result[6] =
      n14 * n32 * n41 -
      n12 * n34 * n41 -
      n14 * n31 * n42 +
      n11 * n34 * n42 +
      n12 * n31 * n44 -
      n11 * n32 * n44;
    result[10] =
      n12 * n24 * n41 -
      n14 * n22 * n41 +
      n14 * n21 * n42 -
      n11 * n24 * n42 -
      n12 * n21 * n44 +
      n11 * n22 * n44;
    result[14] =
      n14 * n22 * n31 -
      n12 * n24 * n31 -
      n14 * n21 * n32 +
      n11 * n24 * n32 +
      n12 * n21 * n34 -
      n11 * n22 * n34;
    result[3] =
      n23 * n32 * n41 -
      n22 * n33 * n41 -
      n23 * n31 * n42 +
      n21 * n33 * n42 +
      n22 * n31 * n43 -
      n21 * n32 * n43;
    result[7] =
      n12 * n33 * n41 -
      n13 * n32 * n41 +
      n13 * n31 * n42 -
      n11 * n33 * n42 -
      n12 * n31 * n43 +
      n11 * n32 * n43;
    result[11] =
      n13 * n22 * n41 -
      n12 * n23 * n41 -
      n13 * n21 * n42 +
      n11 * n23 * n42 +
      n12 * n21 * n43 -
      n11 * n22 * n43;
    result[15] =
      n12 * n23 * n31 -
      n13 * n22 * n31 +
      n13 * n21 * n32 -
      n11 * n23 * n32 -
      n12 * n21 * n33 +
      n11 * n22 * n33;

    const determinant =
      n11 * result[0] + n21 * result[4] + n31 * result[8] + n41 * result[12];

    if (determinant === 0) {
      throw new Error("Can't invert matrix, determinant is 0");
    }

    for (let i = 0; i < result.length; i++) {
      result[i] /= determinant;
    }

    return new Matrix4(...result);
  }

  // fov ... rad
  // aspect ... w / h
  static getPerspectiveMatrix(fov, aspect, near, far) {
    const f = 1 / Math.tan(fov / 2);
    const rangeInv = 1 / (near - far); // for gl

    const m00 = f / aspect;
    const m01 = 0;
    const m02 = 0;
    const m03 = 0;

    const m10 = 0;
    const m11 = f;
    const m12 = 0;
    const m13 = 0;

    const m20 = 0;
    const m21 = 0;
    const m22 = (near + far) * rangeInv;
    const m23 = -1;

    const m30 = 0;
    const m31 = 0;
    const m32 = near * far * rangeInv * 2;
    const m33 = 0;

    // prettier-ignore
    return new Matrix4(
      m00, m01, m02, m03,
      m10, m11, m12, m13,
      m20, m21, m22, m23,
      m30, m31, m32, m33
    );
  }
}
