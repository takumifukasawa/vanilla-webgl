
export class Matrix4 {

  static getIdentityMatrix() {
    return [
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ];
  }

  static getTranslationMatrix(x, y, z) {
    return [
      0, 0, 0, 0,
      0, 0, 0, 0,
      0, 0, 0, 0,
      x, y, z, 1
      // 0, 0, 0, x,
      // 0, 0, 0, y,
      // 0, 0, 0, z,
      // 0, 0, 0, 1
    ];
  }

  static getRotationYMatrix(rad) {
    return [
      // col-order
      // Math.cos(rad), 0, -Math.sin(rad), 0,
      // 0, 1, 0, 0,
      // Math.sin(rad), Math.cos(rad), 0, 0,
      // 0, 0, 0, 1
      // row-order
      Math.cos(rad), 0, Math.sin(rad), 0,
      0, 1, 0, 0,
      -Math.sin(rad), Math.cos(rad), 0, 0,
      0, 0, 0, 1
    ];
  }

  static getScalingMatrix(x, y, z) {
    return [
      x, 0, 0, 0,
      0, y, 0, 0,
      0, 0, z, 0,
      0, 0, 0, 1
    ];
  }

   static getLookAtMatrix(eye, center, up) {
		 const eyeX    = eye[0],    eyeY    = eye[1],    eyeZ    = eye[2],
		 	upX     = up[0],     upY     = up[1],     upZ     = up[2],
       centerX = center[0], centerY = center[1], centerZ = center[2];

    const dest = Matrix4.getIdentityMatrix();

     // tmp
		 // if(eyeX == centerX && eyeY == centerY && eyeZ == centerZ){return this.identity(dest);}
		 var x0, x1, x2, y0, y1, y2, z0, z1, z2, l;
		 z0 = eyeX - center[0]; z1 = eyeY - center[1]; z2 = eyeZ - center[2];
		 l = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
		 z0 *= l; z1 *= l; z2 *= l;
		 x0 = upY * z2 - upZ * z1;
		 x1 = upZ * z0 - upX * z2;
		 x2 = upX * z1 - upY * z0;
		 l = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
		 if(!l){
		 	x0 = 0; x1 = 0; x2 = 0;
		 } else {
		 	l = 1 / l;
		 	x0 *= l; x1 *= l; x2 *= l;
		 }
		 y0 = z1 * x2 - z2 * x1; y1 = z2 * x0 - z0 * x2; y2 = z0 * x1 - z1 * x0;
		 l = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
		 if(!l){
		 	y0 = 0; y1 = 0; y2 = 0;
		 } else {
		 	l = 1 / l;
		 	y0 *= l; y1 *= l; y2 *= l;
		 }
		 dest[0] = x0; dest[1] = y0; dest[2]  = z0; dest[3]  = 0;
		 dest[4] = x1; dest[5] = y1; dest[6]  = z1; dest[7]  = 0;
		 dest[8] = x2; dest[9] = y2; dest[10] = z2; dest[11] = 0;
		 dest[12] = -(x0 * eyeX + x1 * eyeY + x2 * eyeZ);
		 dest[13] = -(y0 * eyeX + y1 * eyeY + y2 * eyeZ);
		 dest[14] = -(z0 * eyeX + z1 * eyeY + z2 * eyeZ);
		 dest[15] = 1;
		 return dest;
   }

  // static getPerspectiveMatrix(fov, aspect, near, far) {
  //   const f = 1.0 / Math.tan(fov / 2);
  //   const rangeInv = 1 / (near - far);
  //   return [
  //     f / aspect, 0,  0,  0,
  //     0,  f,  0,  0,
  //     0,  0,  (near + far) * rangeInv,  -1,
  //     0,  0,  near * far * rangeInv * 2,  0
  //   ];
  // }

  static getPerspectiveMatrix(fov, aspect, near, far) {
    const dest = [];
    const t = near * Math.tan(fov * Math.PI / 360);
		const r = t * aspect;
		const a = r * 2, b = t * 2, c = far - near;
		dest[0] = near * 2 / a;
		dest[1] = 0;
		dest[2] = 0;
		dest[3] = 0;
		dest[4] = 0;
		dest[5] = near * 2 / b;
		dest[6] = 0;
		dest[7] = 0;
		dest[8] = 0;
		dest[9] = 0;
		dest[10] = -(far + near) / c;
		dest[11] = -1;
		dest[12] = 0;
		dest[13] = 0;
		dest[14] = -(far * near * 2) / c;
		dest[15] = 0;
		return dest;
  }

  // https://github.com/gregtatum/mdn-model-view-projection/blob/master/shared/matrices.js
  static getOrthographicMatrix(left, right, bottom, top, near, far) {
    // Each of the parameters represents the plane of the bounding box

    const lr = 1 / (left - right);
    const bt = 1 / (bottom - top);
    const nf = 1 / (near - far);

    const row4col1 = (left + right) * lr;
    const row4col2 = (top + bottom) * bt;
    const row4col3 = (far + near) * nf;

    return [
       -2 * lr,        0,        0, 0,
             0,  -2 * bt,        0, 0,
             0,        0,   2 * nf, 0,
      row4col1, row4col2, row4col3, 1
    ];
  }

  // https://github.com/gregtatum/mdn-model-view-projection/blob/master/shared/matrices.js
  static multiplyPoint(matrix, point) {

    const x = point[0], y = point[1], z = point[2], w = point[3];

    const c1r1 = matrix[ 0], c2r1 = matrix[ 1], c3r1 = matrix[ 2], c4r1 = matrix[ 3],
        c1r2 = matrix[ 4], c2r2 = matrix[ 5], c3r2 = matrix[ 6], c4r2 = matrix[ 7],
        c1r3 = matrix[ 8], c2r3 = matrix[ 9], c3r3 = matrix[10], c4r3 = matrix[11],
        c1r4 = matrix[12], c2r4 = matrix[13], c3r4 = matrix[14], c4r4 = matrix[15];

    return [
      x*c1r1 + y*c1r2 + z*c1r3 + w*c1r4,
      x*c2r1 + y*c2r2 + z*c2r3 + w*c2r4,
      x*c3r1 + y*c3r2 + z*c3r3 + w*c3r4,
      x*c4r1 + y*c4r2 + z*c4r3 + w*c4r4
    ];
  }

  // ref: https://github.com/gregtatum/mdn-model-view-projection/blob/master/shared/matrices.js
  static multiplyMatrix(a, b) {
    // TODO - Simplify for explanation
    // currently taken from https://github.com/toji/gl-matrix/blob/master/src/gl-matrix/mat4.js#L306-L337

    // var result = [];

    // var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
    //     a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
    //     a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
    //     a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];

    // // Cache only the current line of the second matrix
    // var b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
    // result[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    // result[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    // result[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    // result[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    // b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
    // result[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    // result[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    // result[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    // result[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    // b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
    // result[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    // result[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    // result[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    // result[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    // b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
    // result[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
    // result[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
    // result[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
    // result[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;

    // return result;


		const ae = a;
		const be = b;
    const te = Matrix4.getIdentityMatrix();

		const a11 = ae[ 0 ], a12 = ae[ 4 ], a13 = ae[ 8 ], a14 = ae[ 12 ];
		const a21 = ae[ 1 ], a22 = ae[ 5 ], a23 = ae[ 9 ], a24 = ae[ 13 ];
		const a31 = ae[ 2 ], a32 = ae[ 6 ], a33 = ae[ 10 ], a34 = ae[ 14 ];
		const a41 = ae[ 3 ], a42 = ae[ 7 ], a43 = ae[ 11 ], a44 = ae[ 15 ];

		const b11 = be[ 0 ], b12 = be[ 4 ], b13 = be[ 8 ], b14 = be[ 12 ];
		const b21 = be[ 1 ], b22 = be[ 5 ], b23 = be[ 9 ], b24 = be[ 13 ];
		const b31 = be[ 2 ], b32 = be[ 6 ], b33 = be[ 10 ], b34 = be[ 14 ];
		const b41 = be[ 3 ], b42 = be[ 7 ], b43 = be[ 11 ], b44 = be[ 15 ];

		te[ 0 ] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
		te[ 4 ] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
		te[ 8 ] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
		te[ 12 ] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

		te[ 1 ] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
		te[ 5 ] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
		te[ 9 ] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
		te[ 13 ] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

		te[ 2 ] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
		te[ 6 ] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
		te[ 10 ] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
		te[ 14 ] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

		te[ 3 ] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
		te[ 7 ] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
		te[ 11 ] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
		te[ 15 ] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

    return te;
  }

  // ref: https://github.com/gregtatum/mdn-model-view-projection/blob/master/shared/matrices.js
  static multiplyMatrices(...matrices) {
    // TODO - Simplify for explanation
    // currently taken from https://github.com/toji/gl-matrix/blob/master/src/gl-matrix/mat4.js#L306-L337

    let m = Matrix4.getIdentityMatrix();

    for(let i in matrices) {
      m = Matrix4.multiplyMatrix(m, matrices[i]);
    }

    return m;
  }

  // ref: https://github.com/gregtatum/mdn-model-view-projection/blob/master/shared/matrices.js
  static getInverseMatrix(matrix) {
	  // Adapted from: https://github.com/mrdoob/three.js/blob/master/src/math/Matrix4.js

	  // Performance note: Try not to allocate memory during a loop. This is done here
	  // for the ease of understanding the code samples.
	  const result = [];

	  const n11 = matrix[0], n12 = matrix[4], n13 = matrix[ 8], n14 = matrix[12];
	  const n21 = matrix[1], n22 = matrix[5], n23 = matrix[ 9], n24 = matrix[13];
	  const n31 = matrix[2], n32 = matrix[6], n33 = matrix[10], n34 = matrix[14];
	  const n41 = matrix[3], n42 = matrix[7], n43 = matrix[11], n44 = matrix[15];

	  result[ 0] = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44;
	  result[ 4] = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44;
	  result[ 8] = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44;
	  result[12] = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;
	  result[ 1] = n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44;
	  result[ 5] = n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44;
	  result[ 9] = n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44;
	  result[13] = n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34;
	  result[ 2] = n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44;
	  result[ 6] = n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44;
	  result[10] = n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44;
	  result[14] = n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34;
	  result[ 3] = n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43;
	  result[ 7] = n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43;
	  result[11] = n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43;
	  result[15] = n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33;

	  const determinant = n11 * result[0] + n21 * result[4] + n31 * result[8] + n41 * result[12];

	  if ( determinant === 0 ) {
	  	throw new Error("Can't invert matrix, determinant is 0");
	  }

	  for( const i=0; i < result.length; i++ ) {
	  	result[i] /= determinant;
	  }

	  return result;
  }
}