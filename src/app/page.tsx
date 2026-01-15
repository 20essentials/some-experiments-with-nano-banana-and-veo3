import { Background } from '@/components/background';
import { Hero } from '@/components/hero';
import {SliderImageTransitions} from '@/components/slider-image-transitions';

export default function Home() {
  return (
    <>
      <Background />
      <Hero />
      <SliderImageTransitions />
    </>
  );
}
