export const getArray = ({ fileExtension = 'mp4' }: { fileExtension?: string }) =>
  Array.from({ length: 20 }, (_, i) => {
    const num = i + 1;
    return `/assets/media/${num}/${num}.${fileExtension}`;
  });

export const arrayVideos = getArray({});
export const arrayImages = getArray({ fileExtension: 'avif' }).map(src => ({
  src
}));
