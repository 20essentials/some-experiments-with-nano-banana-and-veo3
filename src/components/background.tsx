'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import chroma from 'chroma-js';

type Conf = {
  nx: number;
  ny: number;
  cscale: chroma.Scale;
  darken: number;
  angle: number;
  timeCoef: number;
};

export function Background() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const conf: Conf = {
      nx: 40,
      ny: 100,
      cscale: chroma
        .scale(['#2175D8', '#DC5DCE', '#CC223D', '#F07414', '#FDEE61', '#74C425'])
        .mode('lch'),
      darken: -1,
      angle: Math.PI / 3,
      timeCoef: 0.1
    };

    let renderer: THREE.WebGLRenderer;
    let scene: THREE.Scene;
    let camera: THREE.OrthographicCamera;

    const rnd = THREE.MathUtils.randFloat;
    const uTime = { value: 0 };
    const uTimeCoef = { value: conf.timeCoef };

    const Polyline = (points: THREE.Vector3[]) => {
      const count = points.length;

      const geometry = new THREE.BufferGeometry();
      const position = new Float32Array(count * 6);
      const prev = new Float32Array(count * 6);
      const next = new Float32Array(count * 6);
      const side = new Float32Array(count * 2);
      const uv = new Float32Array(count * 4);
      const index = new Uint32Array((count - 1) * 6);

      for (let i = 0; i < count; i++) {
        const i2 = i * 2;
        side.set([-1, 1], i2);

        const v = i / (count - 1);
        uv.set([0, v, 1, v], i * 4);

        points[i].toArray(position, i * 6);
        points[i].toArray(position, i * 6 + 3);

        const pPrev = points[i - 1] ?? points[i];
        const pNext = points[i + 1] ?? points[i];

        pPrev.toArray(prev, i * 6);
        pPrev.toArray(prev, i * 6 + 3);
        pNext.toArray(next, i * 6);
        pNext.toArray(next, i * 6 + 3);

        if (i < count - 1) {
          index.set([i2, i2 + 1, i2 + 2, i2 + 2, i2 + 1, i2 + 3], i * 6);
        }
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(position, 3));
      geometry.setAttribute('prev', new THREE.BufferAttribute(prev, 3));
      geometry.setAttribute('next', new THREE.BufferAttribute(next, 3));
      geometry.setAttribute('side', new THREE.BufferAttribute(side, 1));
      geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
      geometry.setIndex(new THREE.BufferAttribute(index, 1));

      return geometry;
    };

    const init = () => {
      renderer = new THREE.WebGLRenderer({
        canvas: canvasRef.current!,
        antialias: true
      });

      renderer.setPixelRatio(window.devicePixelRatio);

      camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      scene = new THREE.Scene();

      resize();
      window.addEventListener('resize', resize);
      document.body.addEventListener('click', initRandomScene);

      initScene();
      requestAnimationFrame(animate);
    };

    const initScene = () => {
      disposeScene();
      scene = new THREE.Scene();

      const vertexShader = `
        uniform float uTime;
        uniform float uTimeCoef;
        uniform float uSize;
        uniform mat2 uMat2;
        uniform vec3 uRnd1;
        uniform vec3 uRnd2;
        uniform vec3 uRnd3;
        uniform vec3 uRnd4;
        uniform vec3 uRnd5;
        attribute float side;
        varying vec2 vUv;

        vec2 dp(vec2 v) {
          return 1.5 * v * uMat2;
        }

        void main() {
          vUv = uv;

          vec2 pos = dp(position.xy);
          vec2 normal = dp(vec2(1.0, 0.0)) * uSize;
          float t = uTime * uTimeCoef;

          vec3 r1 = cos(t * uRnd1 + uRnd3);
          vec3 r2 = cos(t * uRnd2 + uRnd4);

          normal *= 1.0
            + uRnd5.x * (cos((position.y + r1.x) * 20.0 * r1.y) + 1.0)
            + uRnd5.y * (sin((position.y + r2.x) * 20.0 * r2.y) + 1.0)
            + uRnd5.z * (cos((position.y + r1.z) * 20.0 * r2.z) + 1.0);

          pos -= normal * side;
          gl_Position = vec4(pos, 0.0, 1.0);
        }
      `;

      const fragmentShader = `
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        varying vec2 vUv;

        void main() {
          gl_FragColor = vec4(mix(uColor1, uColor2, vUv.x), 1.0);
        }
      `;

      const dx = 2 / conf.nx;
      const dy = -2 / (conf.ny - 1);
      const ox = -1 + dx / 2;
      const oy = 1;

      const mat2 = new Float32Array([
        Math.cos(conf.angle),
        -Math.sin(conf.angle),
        Math.sin(conf.angle),
        Math.cos(conf.angle)
      ]);

      for (let i = 0; i < conf.nx; i++) {
        const points: THREE.Vector3[] = [];

        for (let j = 0; j < conf.ny; j++) {
          points.push(new THREE.Vector3(ox + i * dx, oy + j * dy, 0));
        }

        const geometry = Polyline(points);

        const material = new THREE.ShaderMaterial({
          uniforms: {
            uTime,
            uTimeCoef,
            uMat2: { value: mat2 },
            uSize: { value: 1.5 / conf.nx },
            uRnd1: {
              value: new THREE.Vector3(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1))
            },
            uRnd2: {
              value: new THREE.Vector3(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1))
            },
            uRnd3: {
              value: new THREE.Vector3(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1))
            },
            uRnd4: {
              value: new THREE.Vector3(rnd(-1, 1), rnd(-1, 1), rnd(-1, 1))
            },
            uRnd5: {
              value: new THREE.Vector3(
                rnd(0.2, 0.5),
                rnd(0.3, 0.6),
                rnd(0.4, 0.7)
              )
            },
            uColor1: { value: new THREE.Color(conf.cscale(i / conf.nx).hex()) },
            uColor2: {
              value: new THREE.Color(
                conf
                  .cscale(i / conf.nx)
                  .darken(conf.darken)
                  .hex()
              )
            }
          },
          vertexShader,
          fragmentShader
        });

        scene.add(new THREE.Mesh(geometry, material));
      }
    };

    const initRandomScene = () => {
      conf.nx = Math.floor(rnd(20, 200));
      conf.cscale = chroma
        .scale(
          Array.from({ length: 2 + Math.floor(rnd(0, 4)) }, () => chroma.random())
        )
        .mode('lch');
      conf.darken = rnd(0, 1) > 0.5 ? rnd(-4, -0.5) : rnd(0.5, 4);
      conf.angle = rnd(0, Math.PI * 2);
      uTimeCoef.value = rnd(0.05, 0.2);
      initScene();
    };

    const disposeScene = () => {
      if (!scene) return;
      scene.traverse(obj => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry.dispose();
          if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
          else obj.material.dispose();
        }
      });
      scene.clear();
    };

    const animate = (t: number) => {
      uTime.value = t * 0.001;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    const resize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    init();

    return () => {
      window.removeEventListener('resize', resize);
      document.body.removeEventListener('click', initRandomScene);
      disposeScene();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas ref={canvasRef} className='fixed inset-0 -z-10 h-screen w-full' />
  );
}
