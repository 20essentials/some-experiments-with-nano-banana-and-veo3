export const getArray = () => Array.from({ length: 20 }, (_, i) => {
  const num = i + 1;
  return `/assets/media/${num}/${num}.avif`;
});

export const arrayImages = getArray()