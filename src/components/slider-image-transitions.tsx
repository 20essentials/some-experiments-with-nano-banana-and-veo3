'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

type ImageItem = { src: string };

type Screen = {
  width: number;
  height: number;
  wWidth: number;
  wHeight: number;
  ratio: number;
};

export default function SliderImageTransitions() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const images: ImageItem[] = [
      { src: 'https://assets.codepen.io/33787/img1.jpg' },
      { src: 'https://assets.codepen.io/33787/img2.jpg' },
      { src: 'https://assets.codepen.io/33787/img3.jpg' },
      { src: 'https://assets.codepen.io/33787/img4.jpg' }
    ];

    const size = 10;
    const textures: THREE.Texture[] = [];
    const loader = new THREE.TextureLoader();

    const screen: Screen = {
      width: window.innerWidth,
      height: window.innerHeight,
      wWidth: 0,
      wHeight: 0,
      ratio: window.innerWidth / window.innerHeight
    };

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: false
    });

    const camera = new THREE.PerspectiveCamera(50, screen.ratio, 0.1, 1000);
    camera.position.z = 150;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    const mouse = new THREE.Vector2();

    let progress = 0;
    let targetProgress = 0;

    function getRendererSize() {
      const vFOV = (camera.fov * Math.PI) / 180;
      const height = 2 * Math.tan(vFOV / 2) * Math.abs(camera.position.z);
      const width = height * camera.aspect;
      return { width, height };
    }

    function resize() {
      screen.width = window.innerWidth;
      screen.height = window.innerHeight;
      screen.ratio = screen.width / screen.height;
      renderer.setSize(screen.width, screen.height);
      camera.aspect = screen.ratio;
      camera.updateProjectionMatrix();
      const r = getRendererSize();
      screen.wWidth = r.width;
      screen.wHeight = r.height;
      plane1.resize();
      plane2.resize();
    }

    window.addEventListener('resize', resize);

    document.addEventListener('mousemove', e => {
      mouse.x = (e.clientX / screen.width) * 2 - 1;
      mouse.y = -(e.clientY / screen.height) * 2 + 1;
    });

    document.addEventListener('wheel', e => {
      targetProgress += e.deltaY > 0 ? 0.05 : -0.05;
      targetProgress = Math.max(0, Math.min(images.length - 1, targetProgress));
    });

    document.addEventListener('click', e => {
      if (e.clientY < screen.height / 2) targetProgress--;
      else targetProgress++;
      targetProgress = Math.max(0, Math.min(images.length - 1, targetProgress));
    });

    function lerp(a: number, b: number, t: number) {
      return a + (b - a) * t;
    }

    function loadTextures() {
      return Promise.all(
        images.map(
          img =>
            new Promise<void>(resolve => {
              loader.load(img.src, t => {
                textures.push(t);
                resolve();
              });
            })
        )
      );
    }

    class AnimatedPlane {
      o3d = new THREE.Object3D();
      mesh!: THREE.InstancedMesh;
      material!: THREE.MeshBasicMaterial;
      geometry!: THREE.BufferGeometry;
      uProgress = { value: 0 };
      uvScale = new THREE.Vector2();
      size: number;
      texture: THREE.Texture;
      anim: number;
      nx = 0;
      ny = 0;
      count = 0;
      wSize = 0;

      constructor(texture: THREE.Texture, anim: number) {
        this.texture = texture;
        this.anim = anim;
        this.size = size;
        this.init();
      }

      init() {
        this.material = new THREE.MeshBasicMaterial({
          map: this.texture,
          transparent: true,
          side: THREE.DoubleSide
        });

        this.material.onBeforeCompile = shader => {
          shader.uniforms.progress = this.uProgress;
          shader.uniforms.uvScale = { value: this.uvScale };

          shader.vertexShader =
            `
            uniform float progress;
            uniform vec2 uvScale;
            attribute vec3 offset;
            attribute vec3 rotation;
            attribute vec2 uvOffset;
          ` + shader.vertexShader;

          shader.vertexShader = shader.vertexShader.replace(
            '#include <uv_vertex>',
            'vUv = uv * uvScale + uvOffset;'
          );

          shader.vertexShader = shader.vertexShader.replace(
            '#include <begin_vertex>',
            `
            vec3 transformed = position;
            transformed += offset * progress;
            `
          );
        };

        this.resize();
      }

      resize() {
        if (this.mesh) this.o3d.remove(this.mesh);

        this.wSize = (this.size * screen.wWidth) / screen.width;
        this.nx = Math.ceil(screen.wWidth / this.wSize);
        this.ny = Math.ceil(screen.wHeight / this.wSize);
        this.count = this.nx * this.ny;

        const positions = new Float32Array([
          -this.wSize / 2,
          -this.wSize / 2,
          0,
          this.wSize / 2,
          -this.wSize / 2,
          0,
          -this.wSize / 2,
          this.wSize / 2,
          0,
          this.wSize / 2,
          this.wSize / 2,
          0
        ]);

        const uvs = new Float32Array([0, 0, 1, 0, 0, 1, 1, 1]);

        const indices = new Uint16Array([0, 2, 1, 2, 3, 1]);

        this.geometry = new THREE.BufferGeometry();
        this.geometry.setAttribute(
          'position',
          new THREE.BufferAttribute(positions, 3)
        );
        this.geometry.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
        this.geometry.setIndex(new THREE.BufferAttribute(indices, 1));

        const offsets = new Float32Array(this.count * 3);
        for (let i = 0; i < offsets.length; i += 3) {
          offsets[i] = THREE.MathUtils.randFloatSpread(30);
          offsets[i + 1] = THREE.MathUtils.randFloat(20, 80);
          offsets[i + 2] = THREE.MathUtils.randFloat(20, 120);
        }

        this.geometry.setAttribute(
          'offset',
          new THREE.InstancedBufferAttribute(offsets, 3)
        );

        const uvOffsets = new Float32Array(this.count * 2);
        let idx = 0;
        for (let x = 0; x < this.nx; x++) {
          for (let y = 0; y < this.ny; y++) {
            uvOffsets[idx++] = x / this.nx;
            uvOffsets[idx++] = y / this.ny;
          }
        }

        this.geometry.setAttribute(
          'uvOffset',
          new THREE.InstancedBufferAttribute(uvOffsets, 2)
        );

        this.mesh = new THREE.InstancedMesh(
          this.geometry,
          this.material,
          this.count
        );

        let i = 0;
        const dummy = new THREE.Object3D();
        for (let x = 0; x < this.nx; x++) {
          for (let y = 0; y < this.ny; y++) {
            dummy.position.set(
              (x - this.nx / 2) * this.wSize,
              (y - this.ny / 2) * this.wSize,
              0
            );
            dummy.updateMatrix();
            this.mesh.setMatrixAt(i++, dummy.matrix);
          }
        }

        this.o3d.add(this.mesh);
      }

      setTexture(t: THREE.Texture) {
        this.texture = t;
        this.material.map = t;
      }
    }

    let plane1: AnimatedPlane;
    let plane2: AnimatedPlane;
    const planes = new THREE.Object3D();
    scene.add(planes);

    loadTextures().then(() => {
      resize();
      plane1 = new AnimatedPlane(textures[0], 1);
      plane2 = new AnimatedPlane(textures[1], 2);
      planes.add(plane1.o3d);
      planes.add(plane2.o3d);
      animate();
    });

    function animate() {
      requestAnimationFrame(animate);

      progress = lerp(progress, targetProgress, 0.08);
      const i = Math.floor(progress);
      plane1.setTexture(textures[i]);
      plane2.setTexture(textures[i + 1] || textures[i]);

      plane1.uProgress.value = progress % 1;
      plane2.uProgress.value = -1 + (progress % 1);

      planes.rotation.x = lerp(planes.rotation.x, -mouse.y * 0.2, 0.1);
      planes.rotation.y = lerp(planes.rotation.y, mouse.x * 0.2, 0.1);

      renderer.render(scene, camera);
    }

    return () => {
      renderer.dispose();
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className='w-full h-screen block' />;
}
