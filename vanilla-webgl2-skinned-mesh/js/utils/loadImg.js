export default async function loadImg(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve(img);
    };
    img.onerror = () => {
      reject('cannot load img');
    };
    img.src = src;
  });
}
