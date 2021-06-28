// obj の情報はここに書いてある
// https://ja.wikipedia.org/wiki/Wavefront_.obj%E3%83%95%E3%82%A1%E3%82%A4%E3%83%AB

export default async function loadObj(path) {
  const response = await fetch(path);
  const text = await response.text();
  const lines = text.split('\n');

  // webgl用のデータ群
  const positions = [];
  const uvs = [];
  const normals = [];
  const indices = [];

  // objから読みだした生データ
  const rawPositions = [];
  const rawUvs = [];
  const rawNormals = [];
  const rawFaces = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const elements = line.split(' ');
    const head = elements[0];
    switch (head) {
      // position
      case 'v':
        rawPositions.push([
          Number.parseFloat(elements[1]),
          Number.parseFloat(elements[2]),
          Number.parseFloat(elements[3]),
        ]);
        break;
      // uv
      case 'vt':
        rawUvs.push([
          Number.parseFloat(elements[1]),
          Number.parseFloat(elements[2]),
        ]);
        break;
      // normal
      case 'vn':
        rawNormals.push([
          Number.parseFloat(elements[1]),
          Number.parseFloat(elements[2]),
          Number.parseFloat(elements[3]),
        ]);
        break;
      // face
      // p/n/uv の配列
      case 'f':
        rawFaces.push([elements[1], elements[2], elements[3]]);
        break;
    }
  }

  // TODO: normal, uv が存在しないときの対応
  for (let i = 0; i < rawFaces.length; i++) {
    const face = rawFaces[i];

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

    positions.push(rawPositions[p0]);
    positions.push(rawPositions[p1]);
    positions.push(rawPositions[p2]);

    uvs.push(rawUvs[uv0]);
    uvs.push(rawUvs[uv1]);
    uvs.push(rawUvs[uv2]);

    normals.push(rawNormals[n0]);
    normals.push(rawNormals[n1]);
    normals.push(rawNormals[n2]);

    const offset = i * 2;
    indices.push(i + offset, i + offset + 1, i + offset + 2);
  }

  return {
    positions: positions.flat(),
    uvs: uvs.flat(),
    normals: normals.flat(),
    indices: indices.flat(),
  };
}
