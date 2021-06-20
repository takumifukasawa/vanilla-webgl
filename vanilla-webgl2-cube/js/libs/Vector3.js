export class Vector3 {
  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  // static multiplyMatrix4(mat, v) {
  //   const m = mat.elements;
  //   // prettier-ignore
  //   const
  //     m00 = m[0], m01 = m[1], m02 = m[2], m03 = m[3],
  //     m10 = m[4], m11 = m[5], m12 = m[6], m13 = m[7],
  //     m20 = m[8], m21 = m[9], m22 = m[10], m23 = m[11],
  //     m30 = m[12], m31 = m[13], m32 = m[14], m33 = m[15];
  //   return [
  //     v.x * m00 + v.y * m10 + v.z * m20 + v.w * m30,
  //     v.x * m01 + v.y * m11 + v.z * m21 + v.w * m31,
  //     v.x * m02 + v.y * m12 + v.z * m22 + v.w * m32,
  //     v.x * m03 + v.y * m13 + v.z * m23 + v.w * m33,
  //   ];
  // }
}
