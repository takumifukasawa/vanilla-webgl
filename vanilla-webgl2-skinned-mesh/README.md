# skinned mesh

初期姿勢行列はローカル座標の原点にあるジョイントを初期姿勢の位置に移動・回転させるものです
ボーンオフセット行列は初期姿勢行列の逆行列
ボーンオフセット行列は、ボーンを基準に回転させるためのもの。ボーンを原点に戻して回転してまた戻す。

## 参考

[その 27 アニメーションの根っこ：スキンメッシュアニメーション（ボーン操作）](http://marupeke296.com/DXG_No27_SkinMeshAnimation.html)
[その 61 完全ホワイトボックスなスキンメッシュアニメーションの解説](http://marupeke296.com/DXG_No61_WhiteBoxSkinMeshAnimation.html)
[WebGL2 Skinning](https://webgl2fundamentals.org/webgl/lessons/webgl-skinning.html)
[glTF 2.0 Quick Reference Guide](https://www.khronos.org/files/gltf20-reference-guide.pdf)
[[WebGL] スキニングメッシュ（ボーン）の仕組みを自前で実装してみる](https://qiita.com/edo_m18/items/31ee6cbc3b3ff22013ae)
