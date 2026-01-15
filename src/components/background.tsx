'use client'

import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import chroma, { Scale } from 'chroma-js'

export function Background() {
  useEffect(() => {

  }, [])

  return (
    <canvas
      id='canvas'
      className='block fixed inset-0 h-screen w-full -z-10'
    ></canvas>
  );
}
