export default async function loadObj(path) {
  const response = await fetch(path);
  const text = await response.text();
  const lines = text.split('\n');

  const positions = [];
  const uvs = [];
  const normals = [];
  const indices = [];

  const faces = [];

  const tmpPositions = [];
  const tmpUvs = [];
  const tmpNormals = [];
  const tmpIndices = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const elements = line.split(' ');
    const head = elements[0];
    switch (head) {
      // position
      case 'v':
        tmpPositions.push([
          Number.parseFloat(elements[1]),
          Number.parseFloat(elements[2]),
          Number.parseFloat(elements[3]),
        ]);
        break;
      // uv
      case 'vt':
        tmpUvs.push([
          Number.parseFloat(elements[1]),
          Number.parseFloat(elements[2]),
        ]);
        break;
      // normal
      case 'vn':
        tmpNormals.push([
          Number.parseFloat(elements[1]),
          Number.parseFloat(elements[2]),
          Number.parseFloat(elements[3]),
        ]);
        break;
      // face
      case 'f':
        faces.push([elements[1], elements[2], elements[3]]);
        break;
    }
  }

  // TODO: normal, uv が存在しないときの対応
  for (let i = 0; i < faces.length; i++) {
    const face = faces[i];
    const v0 = face[0].split('/');
    const v1 = face[1].split('/');
    const v2 = face[2].split('/');

    const p0 = Number.parseInt(v0[0], 10) - 1;
    const uv0 = Number.parseInt(v0[1], 10) - 1;
    const n0 = Number.parseInt(v0[2], 10) - 1;

    const p1 = Number.parseInt(v1[0], 10) - 1;
    const uv1 = Number.parseInt(v1[1], 10) - 1;
    const n1 = Number.parseInt(v1[2], 10) - 1;

    const p2 = Number.parseInt(v2[0], 10) - 1;
    const uv2 = Number.parseInt(v2[1], 10) - 1;
    const n2 = Number.parseInt(v2[2], 10) - 1;

    positions.push(tmpPositions[p0]);
    positions.push(tmpPositions[p1]);
    positions.push(tmpPositions[p2]);

    uvs.push(tmpUvs[uv0]);
    uvs.push(tmpUvs[uv1]);
    uvs.push(tmpUvs[uv2]);

    normals.push(tmpNormals[n0]);
    normals.push(tmpNormals[n1]);
    normals.push(tmpNormals[n2]);

    const offset = i * 2;
    indices.push(i + offset, i + offset + 1, i + offset + 2);
  }

  return {
    positions,
    uvs,
    normals,
    indices,
  };
}
