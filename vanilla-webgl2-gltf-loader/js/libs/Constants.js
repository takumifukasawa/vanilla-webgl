export const FaceType = {
  Front: 'Front', // default
  Back: 'Back',
  None: 'None',
  DoubleSide: 'DoubleSide',
};

export const ActorType = {
  MeshActor: 'MeshActor',
  CameraActor: 'CameraActor',
  ProjectorActor: 'ProjectorActor',
  LightActor: 'LightActor',
  None: 'None',
};

export const ComponentType = {
  MeshComponent: 'MeshComponent',
  ScriptComponent: 'ScriptComponent',
  CameraComponent: 'CameraComponent',
};

export const AttributeType = {
  Position: 'Position',
  Normal: 'Normal',
  Uv: 'UV',
  Tangent: 'Tangent',
  Binormal: 'Binormal',
};

export const PrimitiveType = {
  Points: 'Points',
  Lines: 'Lines',
  Triangles: 'Triangles',
};

export const UniformType = {
  Matrix4fv: 'Matrix4fv',
  Vector3f: 'Vector3f',
  Texture2D: 'Texture2D',
  CubeMap: 'CubeMap',
  Float: 'Float',
};

export const BlendType = {
  Alpha: 'Alpha',
  Additive: 'Additive',
  None: 'None',
};

export const RenderbufferType = {
  Depth: 'Depth',
};

export const CameraType = {
  PerspectiveCamera: 'PerspectiveCamera',
  OrthographicCamera: 'OrthographicCamera',
};

export const TextureType = {
  Rgba: 'Rgba',
  Depth: 'Depth',
};

export const TextureWrapType = {
  Repeat: 'Repeat',
  ClampToEdge: 'ClampToEdge',
};

export const LightType = {
  DirectionalLight: 'DirectionalLight',
  PointLight: 'PointLight',
};
