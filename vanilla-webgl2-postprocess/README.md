# frame-buffer

## memo

画像ファイルを読み込んで UV 座標を使って貼るとき、flipY をすると WebGL のテクスチャ座標にそろえて UV を貼ることができる。

つまり、左下が原点で右にいけば+x、上にいけば+y になる。

メソッド的にはこれ `gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)`

```

plane vertex positions

3 --------- 2
|         / |
|       /   |
|     /     |
|   /       |
| /         |
0 --------- 1

position ... [
  -1, -1, 1,
  1, -1, 1,
  1, 1, 1,
  -1, 1, 1,
],

uv ...[
  0, 1,
  1, 1,
  1, 0,
  0, 0,
],

indices ... [0, 1, 2, 0, 2, 3],
```

render buffer 用のテクスチャを 生成する際は `gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, flag)` を呼ぶ必要はない。

なぜなら、もともと WebGL の UV 座標に合うようなテクスチャのデータ配列になるし、そもそもこのメソッドはデータを展開するときの順番を変えるものなので、render buffer 用には必要ないから。

## 参考

[https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/pixelStorei](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/pixelStorei)

[https://books.google.co.jp/books?id=3c-jmWkLNwUC&pg=PA170&lpg=PA170&dq=webgl+flip+y&source=bl&ots=z1uu5x2CAd&sig=ACfU3U2uPq7RDbQxSGEj3z0HoOA_0-fA3Q&hl=ja&sa=X&ved=2ahUKEwjwp6n2sOfxAhX0yYsBHe16A8kQ6AEwCnoECBUQAw#v=onepage&q=webgl%20flip%20y&f=false](https://books.google.co.jp/books?id=3c-jmWkLNwUC&pg=PA170&lpg=PA170&dq=webgl+flip+y&source=bl&ots=z1uu5x2CAd&sig=ACfU3U2uPq7RDbQxSGEj3z0HoOA_0-fA3Q&hl=ja&sa=X&ved=2ahUKEwjwp6n2sOfxAhX0yYsBHe16A8kQ6AEwCnoECBUQAw#v=onepage&q=webgl%20flip%20y&f=false)
