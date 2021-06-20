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
    // var f = 1.0 / Math.tan(fov / 2);
    // var rangeInv = 1 / (near - far);
    // // prettier-ignore
    // return new Matrix4(
    //   f / aspect, 0, 0, 0,
    //   0, f, 0, 0,
    //   0, 0, (near + far) * rangeInv, -1,
    //   0, 0, near * far * rangeInv * 2, 0
    // );

    // const f = 1 / Math.tan(fov / 2);
    const f = Math.tan(Math.PI * 0.5 - 0.5 * fov);
    const rangeInv = 1 / (near - far);
    // const s = Math.tan(Math.PI * 0.5 - 0.5 * fov);
    // const frustumRange = far - near;
    // const invFrustumRange = 1 / frustumRange;
    // const invFrustumPosition = -near;

    // const t = near * Math.tan(fov / 2);
    // const r = t * aspect;
    // const a = r * 2;
    // const b = t * 2;
    // const c = far - near;

    const m00 = f / aspect;
    // const m00 = (near * 2) / a;
    const m01 = 0;
    const m02 = 0;
    const m03 = 0;

    const m10 = 0;
    const m11 = f;
    // const m11 = (near * 2) / b;
    const m12 = 0;
    const m13 = 0;

    const m20 = 0;
    const m21 = 0;
    const m22 = (near + far) * rangeInv;
    // const m22 = -(far + near) / c;
    const m23 = -1;

    const m30 = 0;
    const m31 = 0;
    const m32 = near * far * rangeInv * 2;
    // const m23 = -(far * near * 2) / c;
    const m33 = 0;

    // prettier-ignore
    return new Matrix4(
      // f / aspect, 0, 0, 0,
      // 0, f, 0, 0,
      // 0, 0, (near + far) * rangeInv, -1,
      // 0, 0, near * far * rangeInv * 2, 0
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
  static multiplyVector4(mat, v) {
    const m = mat.elements;
    // prettier-ignore
    const
      m00 = m[0], m01 = m[1], m02 = m[2], m03 = m[3],
      m10 = m[4], m11 = m[5], m12 = m[6], m13 = m[7],
      m20 = m[8], m21 = m[9], m22 = m[10], m23 = m[11],
      m30 = m[12], m31 = m[13], m32 = m[14], m33 = m[15];
    return [
      v.x * m00 + v.y * m10 + v.z * m20 + v.w * m30,
      v.x * m01 + v.y * m11 + v.z * m21 + v.w * m31,
      v.x * m02 + v.y * m12 + v.z * m22 + v.w * m32,
      v.x * m03 + v.y * m13 + v.z * m23 + v.w * m33,
    ];
  }
  static multiplyMatrices(ma, mb) {
    const a = ma.elements;
    const b = mb.elements;
    const a00 = a[0],
      a10 = a[1],
      a20 = a[2],
      a30 = a[3],
      a01 = a[4],
      a11 = a[5],
      a21 = a[6],
      a31 = a[7],
      a02 = a[8],
      a12 = a[9],
      a22 = a[10],
      a32 = a[11],
      a03 = a[12],
      a13 = a[13],
      a23 = a[14],
      a33 = a[15];
    const b00 = b[0],
      b10 = b[1],
      b20 = b[2],
      b30 = b[3],
      b01 = b[4],
      b11 = b[5],
      b21 = b[6],
      b31 = b[7],
      b02 = b[8],
      b12 = b[9],
      b22 = b[10],
      b32 = b[11],
      b03 = b[12],
      b13 = b[13],
      b23 = b[14],
      b33 = b[15];

    // TODO: fix calc

    const m00 = a00 * b00 + a01 * b10 + a02 * b20 + a03 * b30;
    const m01 = a00 * b01 + a01 * b11 + a02 * b21 + a03 * b31;
    const m02 = a00 * b02 + a01 * b12 + a02 * b22 + a03 * b32;
    const m03 = a00 * b03 + a01 * b13 + a02 * b23 + a03 * b33;

    const m10 = a10 * b00 + a11 * b10 + a12 * b20 + a13 * b30;
    const m11 = a10 * b01 + a11 * b11 + a12 * b21 + a13 * b31;
    const m12 = a10 * b02 + a11 * b12 + a12 * b22 + a13 * b32;
    const m13 = a10 * b03 + a11 * b13 + a12 * b23 + a13 * b33;

    const m20 = a20 * b00 + a21 * b10 + a22 * b20 + a23 * b30;
    const m21 = a20 * b01 + a21 * b11 + a22 * b21 + a23 * b31;
    const m22 = a20 * b02 + a21 * b12 + a22 * b22 + a23 * b32;
    const m23 = a20 * b03 + a21 * b13 + a22 * b23 + a23 * b33;

    const m30 = a30 * b00 + a31 * b10 + a32 * b20 + a33 * b30;
    const m31 = a30 * b01 + a31 * b11 + a32 * b21 + a33 * b31;
    const m32 = a30 * b02 + a31 * b12 + a32 * b22 + a33 * b32;
    const m33 = a30 * b03 + a31 * b13 + a32 * b23 + a33 * b33;

    // prettier-ignore
    return new Matrix4(
      m00, m01, m02, m03,
      m10, m11, m12, m13,
      m20, m21, m22, m23,
      m30, m31, m32, m33
    );
  }
}
