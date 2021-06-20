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

  getArray() {
    // prettier-ignore
    return [
      this.m00, this.m01, this.m02, this.m03,
      this.m10, this.m11, this.m12, this.m13,
      this.m20, this.m21, this.m22, this.m23,
      this.m30, this.m31, this.m32, this.m33
    ];
  }

  translate(v) {
    this.m30 += v.x;
    this.m31 += v.y;
    this.m32 += v.z;
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
