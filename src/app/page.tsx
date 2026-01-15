import { Background } from '@/components/background';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <Background />
      <section className='relative w-full h-screen flex flex-wrap place-content-center'>
        <img
          src='/assets/title.webp'
          alt='Am Title'
          className='w-[66%] object-contain mix-blend-overlay'
        />

        <Link href={'https://gemini.google/it/overview/image-generation/'}>
          <img
            src='/assets/nanobana.png'
            alt='Nanobana Logo'
            className='w-[4.5vmax] object-contain absolute bottom-[1.5vmax] right-[1.5vmax]'
          />
        </Link>

        <Link href={'https://gemini.google/it/overview/video-generation/'}>
          <img
            src='/assets/veo-3.png'
            alt='Veo3 Logo'
            className='w-[4.5vmax] object-contain absolute top-[1.5vmax] left-[1.5vmax]'
          />
        </Link>
      </section>
    </>
  );
}
