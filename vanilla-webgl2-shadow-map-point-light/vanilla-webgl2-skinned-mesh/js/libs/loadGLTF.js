import Geometry from './Geometry.js';
import Attribute from './Attribute.js';
import { AttributeType } from './Constants.js';

// -------------------------------------------------------------------
// ref:
// https://www.khronos.org/files/gltf20-reference-guide.pdf
//
// - gltf embed 想定
// - position, normal, uv, indices を検知
// - meshは一個想定
// - 複数UV未対応
// - skinnedmesh未対応
// -------------------------------------------------------------------

export default async function loadGLTF({ gpu, gltfPath, binPath }) {
  const gl = gpu.gl;

  const gltfResponse = await fetch(gltfPath);

  const json = await gltfResponse.json();

  const binResponse = await fetch(binPath);

  const binBufferData = await binResponse.arrayBuffer();

  const { accessors, meshes, bufferViews } = json;

  // accessor の component type は gl の format と値が同じ
  // console.log('gl.BYTE', gl.BYTE); // 5120
  // console.log('gl.UNSIGNED_BYTE', gl.UNSIGNED_BYTE); // 5121
  // console.log('gl.SHORT', gl.SHORT); // 5122
  // console.log('gl.UNSIGNED_SHORT', gl.UNSIGNED_SHORT); // 5123
  // console.log('gl.INT', gl.INT); // 5124
  // console.log('gl.UNSIGNED_INT', gl.UNSIGNED_INT); // 5125
  // console.log('gl.FLOAT', gl.FLOAT); // 5126

  // mesh は一個想定なので固定index
  const attributeTypes = [];
  const primitive = meshes[0].primitives[0];
  Object.keys(primitive.attributes).forEach((key) => {
    let type = '';
    switch (key) {
      case 'POSITION':
        type = AttributeType.Position;
        break;
      case 'NORMAL':
        type = AttributeType.Normal;
        break;
      case 'TEXCOORD_0':
        type = AttributeType.Uv;
        break;
      default:
        throw 'invalid primitive type';
    }
    attributeTypes[primitive.attributes[key]] = type;
  });
  // indexとわかる用の適当な名前を割り当て
  attributeTypes[primitive.indices] = 'INDICES';

  const attributes = [];
  let indices;

  for (let i = 0; i < accessors.length; i++) {
    const accessor = accessors[i];

    const bufferViewData = bufferViews[accessor.bufferView];

    // attribute,indexごとにデータを分けるためbufferをslice
    const slicedBufferData = binBufferData.slice(
      bufferViewData.byteOffset,
      bufferViewData.byteOffset + bufferViewData.byteLength,
    );

    const attributeType = attributeTypes[i];

    // attribute,indexの型別にsliceされたデータを typed array に突っ込む
    let data;
    switch (accessor.componentType) {
      case gl.UNSIGNED_SHORT:
        data = new Uint16Array(slicedBufferData);
        break;
      case gl.FLOAT:
        data = new Float32Array(slicedBufferData);
        break;
      default:
        throw 'invalid component type';
    }

    // indexだったらattributeを作成しないため
    if (attributeType === 'INDICES') {
      indices = data;
      continue;
    }

    // locationの順番を揃えるため明示的に指定. attributeはこの順番のlocationにする
    // - position
    // - uv
    // - normal
    // シェーダーのlayoutの順番と揃っている必要があることに注意
    let stride;
    let location;
    switch (attributeType) {
      case AttributeType.Position:
        stride = 3;
        location = 0;
        break;
      case AttributeType.Normal:
        stride = 3;
        location = 2;
        break;
      case AttributeType.Uv:
        stride = 2;
        location = 1;
        break;
      default:
        throw 'invalid attribute type';
    }

    attributes.push(
      new Attribute({
        type: attributeType,
        data,
        stride,
        location,
      }),
    );
  }

  const normalAttribute = attributes.find((attribute) => {
    return attribute.type === AttributeType.Normal;
  });

  if (!normalAttribute) {
    throw 'empty normal attribute';
  }

  const geometry = new Geometry({
    gpu,
    attributes: [
      ...attributes,
      Attribute.createTangent(normalAttribute.data),
      Attribute.createBinormal(normalAttribute.data),
    ],
    indices,
  });

  return { geometry };
}
