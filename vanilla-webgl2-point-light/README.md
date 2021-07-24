# point-light

## 距離減衰

OpenGL1.1 で使われる式。

```
// a ... constant attenuation
// b ... linear attenuation
// c ... quadratic attenuation
// d ... distance to light

1.0 / (a + b * d + c * d * d);
```

ただ、アプリケーションごとに変えてももちろん良いのと、quadratic attenuation を使うことは稀なので、適度に最適化してもよい。

```
ex1. 1.0 / (1.0 + a * d);

ex2. 1.0 / (1.0 + c * d * d);
```

## references

[https://math.hws.edu/graphicsbook/c7/s2.html#webgl3d.2.7](https://math.hws.edu/graphicsbook/c7/s2.html#webgl3d.2.7)
