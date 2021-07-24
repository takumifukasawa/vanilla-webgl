export default class Engine {
  static FaceType = {
    Front: 'Front', // default
    Back: 'Back',
    None: 'None',
    DoubleSide: 'DoubleSide',
  };

  static ActorType = {
    MeshActor: 'MeshActor',
    CameraActor: 'CameraActor',
    ProjectorActor: 'ProjectorActor',
    LightActor: 'LightActor',
    None: 'None',
  };

  static ComponentType = {
    MeshComponent: 'MeshComponent',
    ScriptComponent: 'ScriptComponent',
    CameraComponent: 'CameraComponent',
  };

  static AttributeType = {
    Position: 'Position',
    Normal: 'Normal',
    Uv: 'UV',
    Tangent: 'Tangent',
    Binormal: 'Binormal',
  };

  static PrimitiveType = {
    Points: 'Points',
    Lines: 'Lines',
    Triangles: 'Triangles',
  };

  static UniformType = {
    Matrix4fv: 'Matrix4fv',
    Vector3f: 'Vector3f',
    Texture2D: 'Texture2D',
    CubeMap: 'CubeMap',
    Float: 'Float',
  };

  static BlendType = {
    Alpha: 'Alpha',
    Additive: 'Additive',
    None: 'None',
  };

  static RenderbufferType = {
    Depth: 'Depth',
  };

  static CameraType = {
    PerspectiveCamera: 'PerspectiveCamera',
    OrthographicCamera: 'OrthographicCamera',
  };

  static TextureType = {
    Rgba: 'Rgba',
    Depth: 'Depth',
  };

  static TextureWrapType = {
    Repeat: 'Repeat',
    ClampToEdge: 'ClampToEdge',
  };
}
