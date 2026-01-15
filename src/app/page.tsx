import { Background } from '@/components/background';
import { Hero } from '@/components/hero';
import { SliderImageTransitions } from '@/components/slider-image-transitions';
import { SliderVideoBlurZoom } from '@/components/slider-video-blur-zoom';

export default function Home() {
  return (
    <>
      <Background />
      <Hero />
      <SliderImageTransitions />
      <SliderVideoBlurZoom />
    </>
  );
}
