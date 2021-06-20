export class Matrix4 {
  // prettier-ignore
  constructor(
    m00, m01, m02, m03,
    m10, m11, m12, m13,
    m20, m21, m22, m23,
    m30, m31, m32, m33
  ) {
    this.elements = [
      m00, m01, m02, m03,
      m10, m11, m12, m13,
      m20, m21, m22, m23,
      m30, m31, m32, m33
    ]
  }

  // fov ... rad
  // aspect ... w / h
  static getPerspectiveMatrix(fov, aspect, near, far) {
    const f = 1 / Math.tan(fov / 2);
    const rangeInv = 1 / (near - far);

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

  static getTranslateMatrix(v) {
    // prettier-ignore
    return new Matrix4(
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      v.x, v.y, v.z, 1
    );
  }

  // static multiplyMatrices(ma, mb) {
  //   const a = ma.elements;
  //   const b = mb.elements;
  //   const a00 = a[0],
  //     a01 = a[1],
  //     a02 = a[2],
  //     a03 = a[3],
  //     a10 = a[4],
  //     a11 = a[5],
  //     a12 = a[6],
  //     a13 = a[7],
  //     a20 = a[8],
  //     a21 = a[9],
  //     a22 = a[10],
  //     a23 = a[11],
  //     a30 = a[12],
  //     a31 = a[13],
  //     a32 = a[14],
  //     a33 = a[15];
  //   const b00 = b[0],
  //     b01 = b[1],
  //     b02 = b[2],
  //     b03 = b[3],
  //     b10 = b[4],
  //     b11 = b[5],
  //     b12 = b[6],
  //     b13 = b[7],
  //     b20 = b[8],
  //     b21 = b[9],
  //     b22 = b[10],
  //     b23 = b[11],
  //     b30 = b[12],
  //     b31 = b[13],
  //     b32 = b[14],
  //     b33 = b[15];

  //   // TODO: fix calc

  //   const m00 = a00 * b00 + a01 * b10 + a02 * b20 + a03 * b30;
  //   const m01 = a00 * b01 + a01 * b11 + a02 * b21 + a03 * b31;
  //   const m02 = a00 * b02 + a01 * b12 + a02 * b22 + a03 * b32;
  //   const m03 = a00 * b03 + a01 * b13 + a02 * b23 + a03 * b33;

  //   const m10 = a10 * b00 + a11 * b10 + a12 * b20 + a13 * b30;
  //   const m11 = a10 * b01 + a11 * b11 + a12 * b21 + a13 * b31;
  //   const m12 = a10 * b02 + a11 * b12 + a12 * b22 + a13 * b32;
  //   const m13 = a10 * b03 + a11 * b13 + a12 * b23 + a13 * b33;

  //   const m20 = a20 * b00 + a21 * b10 + a22 * b20 + a23 * b30;
  //   const m21 = a20 * b01 + a21 * b11 + a22 * b21 + a23 * b31;
  //   const m22 = a20 * b02 + a21 * b12 + a22 * b22 + a23 * b32;
  //   const m23 = a20 * b03 + a21 * b13 + a22 * b23 + a23 * b33;

  //   const m30 = a30 * b00 + a31 * b10 + a32 * b20 + a33 * b30;
  //   const m31 = a30 * b01 + a31 * b11 + a32 * b21 + a33 * b31;
  //   const m32 = a30 * b02 + a31 * b12 + a32 * b22 + a33 * b32;
  //   const m33 = a30 * b03 + a31 * b13 + a32 * b23 + a33 * b33;

  //   // prettier-ignore
  //   return new Matrix4(
  //     m00, m01, m02, m03,
  //     m10, m11, m12, m13,
  //     m20, m21, m22, m23,
  //     m30, m31, m32, m33
  //   );
  // }
}
