import { Background } from '@/components/background';
import { Hero } from '@/components/hero';
import { SliderImageTransitions } from '@/components/slider-image-transitions';
import SimpleVideoSlider from '@/components/slider-video';
import { SliderVideoBlurZoom } from '@/components/slider-video-blur-zoom';

export default function Home() {
  return (
    <>
      <Background />
      <Hero />
      <SliderVideoBlurZoom />
      <SimpleVideoSlider />
      <SliderImageTransitions />
    </>
  );
}
