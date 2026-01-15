export const getArray = ({ fileExtension = 'mp4' }: { fileExtension?: string }) =>
  Array.from({ length: 20 }, (_, i) => {
    const num = i + 1;
    return `/assets/media/${num}/${num}.${fileExtension}`;
  }).toSorted(() => Math.random() - 0.5);

export const arrayVideos = getArray({}).map(src => ({
  src
}));

export const arrayImages = getArray({ fileExtension: 'avif' }).map(src => ({
  src
}));
