# projection texture

## 射影テクスチャマッピング

### 変換行列

例えばライトからプロジェクターのように画像を投影したい場合を考える。

その時の投影に使う変換座標はこのように求めることができる。

```
投影するテクスチャの射影変換行列 = テクスチャ座標変換行列 * ライト位置からの射影変換行列 * ライト位置のワールド変換行列
```

より一般化するなら、

```
投影するテクスチャの射影変換行列 = テクスチャ座標変換行列 * 投影する地点からの射影変換行列 * 投影する地点のワールド変換行列
```

射影変換行列は、カメラ用の平行投影や透視投影を使う。

## 投影用テクスチャ座標を計算する

投影用テクスチャ変換行列は、投影されたいオブジェクトの頂点やピクセルによって変わることはないので uniform で 4 次元行列を送ればよい。

テクスチャ座標はその行列を元にシェーダーで計算。

```
投影するテクスチャ座標4次元 = 投影するテクスチャの射影変換行列 * ワールド座標
```

## テクスチャの色算出

### WebGL1

vertex shader

```
...

attribute vec3 aPosition;

uniform mat4 uModelMatrix;
uniform mat4 uTextureProjectionMatrix;

varying vec4 vTextureProjectionUv;

void main() {
  ...
  vec4 worldPosition = uModelMatrix * vec4(aPosition, 1.);
  vTextureProjectionMatrix = uTextureProjectionMatrix * worldPosition;
  ...
}
```

fragment shader

```
...

uniform sampler2D uTexture;

varying vec4 vTextureProjectionUv;

void main() {
  ...
  vec4 color = texture2DProj(uTexture, vTextureProjectionUv);
  ...
}
```

### WebGL2

texture 関数を使う場合、w 除算をしてから算出

vertex shader

```
...

layout (location = 0) aPosition;

uniform mat4 uModelMatrix;
uniform mat4 uTextureProjectionMatrix;

out vec4 vTextureProjectionUv;

void main() {
  ...
  vec4 worldPosition = uModelMatrix * vec4(aPosition, 1.);
  vTextureProjectionMatrix = uTextureProjectionMatrix * worldPosition;
  ...
}
```

fragment shader

```
...

uniform sampler2D uTexture;

in vec4 vTextureProjectionUv;

void main() {
  ...
  vec3 uv = vTextureProjectionUv.xyz / vTextureProjectionUv.w;
  vec4 color = texture2DProj(uTexture, uv.xyz);
  ...
}
```

## テクスチャ座標変換行列

クリップ座標系は[-1~1]が画面  内に映る範囲だが、テクスチャ座標系は[0~1]なので、[-1~1]を[0~1]に変換する作業が必要になる。

その変換は 0.5 でかけてから 0.5 を全体に足すことで求められるので、テクスチャ座標変換行列はこのようになる。

```
0.5, 0, 0, 0,
0, 0.5, 0, 0,
0, 0, 1, 0,
0.5, 0.5, 0, 1,
```

しかし、.jpg,.png などの読み込んだ画像アセットを flipY (つまり `gl.pixelStorei(gl.UNPACK_FLIP_Y, true);`) せずに texture に割り当てている場合は注意が必要。

なぜなら、テクスチャ座標系は左下が原点だが画像アセットの座標系の原点は左上なので、上下反転した状態になってしまう。

もしも flipY をしていた場合は上下反転した状態にはならないので上の行列で問題ない。

flipY をしていない場合は以下の行列になる。

```
0.5, 0, 0, 0,
0, -0.5, 0, 0,
0, 0, 1, 0,
0.5, 0.5, 0, 1,
```

## 投影範囲

変換後の uv 座標の 0~1 の範囲が投影範囲になるので、その範囲のみ描画したい場合は xy が 0~1 の間かどうかを判定して出し分ける。
