'use client';
import { useState, useRef, useEffect } from 'react';
import { arrayVideos } from '@/lib/const';

export default function VideoSlider() {
  const [index, setIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const slides = arrayVideos; // Solo videos

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.src = slides[index].src;
      videoRef.current.load();
      videoRef.current.play();
    }
  }, [index, slides]);

  const handleNext = () => {
    setIndex(prev => (prev + 1) % slides.length);
  };

  return (
    <div className="w-full h-screen relative flex items-center justify-center bg-black">
      <video
        ref={videoRef}
        className="w-full h-full object-cover cursor-pointer"
        onClick={handleNext}
        muted
        autoPlay
        loop
      />
    </div>
  );
}
