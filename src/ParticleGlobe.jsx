import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createHeartParticleAttributes } from './heartParticles.js';
import { TRAIL_FRAME_COUNT, createTrailFrameOpacity } from './renderConfig.js';

function createHeartSpriteTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const context = canvas.getContext('2d');

  context.clearRect(0, 0, 64, 64);
  context.translate(32, 33);
  context.scale(1.18, 1.18);
  context.beginPath();
  context.moveTo(0, 18);
  context.bezierCurveTo(-28, -4, -18, -27, 0, -13);
  context.bezierCurveTo(18, -27, 28, -4, 0, 18);
  context.closePath();
  context.fillStyle = '#ffffff';
  context.shadowColor = 'rgba(255, 120, 180, 0.8)';
  context.shadowBlur = 10;
  context.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function ParticleGlobe({ gestureState }) {
  const mountRef = useRef(null);
  const gestureRef = useRef(gestureState);

  useEffect(() => {
    gestureRef.current = gestureState;
  }, [gestureState]);

  useEffect(() => {
    const mount = mountRef.current;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(52, 1, 0.1, 100);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    const trailCanvas = document.createElement('canvas');
    const trailContext = trailCanvas.getContext('2d');
    const trailFrames = Array.from({ length: TRAIL_FRAME_COUNT }, () => document.createElement('canvas'));
    const group = new THREE.Group();
    const { colors, positions, roles, seeds } = createHeartParticleAttributes();
    const particleCount = seeds.length;
    const basePositions = positions.slice();
    const geometry = new THREE.BufferGeometry();
    const heartSprite = createHeartSpriteTexture();
    const material = new THREE.PointsMaterial({
      size: 0.034,
      sizeAttenuation: true,
      map: heartSprite,
      alphaTest: 0.08,
      transparent: true,
      opacity: 0.95,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.getAttribute('position').setUsage(THREE.DynamicDrawUsage);

    const globe = new THREE.Points(geometry, material);
    group.add(globe);
    scene.add(group);
    camera.position.z = 2.5;
    renderer.autoClear = true;
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    trailCanvas.className = 'trail-canvas';
    mount.appendChild(trailCanvas);
    mount.appendChild(renderer.domElement);

    let animationFrame = 0;
    let currentScale = 1;
    let currentRotationX = 0;
    let currentRotationY = 0;

    const resize = () => {
      const { clientWidth, clientHeight } = mount;
      renderer.setSize(clientWidth, clientHeight, false);
      trailCanvas.width = Math.floor(clientWidth * Math.min(window.devicePixelRatio, 2));
      trailCanvas.height = Math.floor(clientHeight * Math.min(window.devicePixelRatio, 2));
      trailCanvas.style.width = `${clientWidth}px`;
      trailCanvas.style.height = `${clientHeight}px`;
      for (const frame of trailFrames) {
        frame.width = trailCanvas.width;
        frame.height = trailCanvas.height;
        frame.getContext('2d').clearRect(0, 0, frame.width, frame.height);
      }
      camera.aspect = clientWidth / clientHeight;
      camera.position.z = clientWidth < 720 ? 3.15 : 2.7;
      group.position.x = clientWidth < 720 ? 0 : -0.28;
      group.position.y = clientWidth < 720 ? -0.03 : -0.12;
      camera.updateProjectionMatrix();
    };

    const render = (timeMs) => {
      const time = timeMs * 0.001;
      const state = gestureRef.current;
      const positionAttribute = geometry.getAttribute('position');

      currentScale = THREE.MathUtils.lerp(currentScale, state.scale, 0.08);
      currentRotationX = THREE.MathUtils.lerp(currentRotationX, state.rotationX, 0.06);
      currentRotationY = THREE.MathUtils.lerp(currentRotationY, state.rotationY, 0.06);

      for (let index = 0; index < particleCount; index += 1) {
        const offset = index * 3;
        const isOrbit = roles[index] === 1;
        const wave = Math.sin(time * (isOrbit ? 3.3 : 1.9) + seeds[index] + basePositions[offset + 1] * 4);
        const pulse = isOrbit
          ? 1 + state.expansion * 0.34 + wave * state.expansion * 0.08
          : 1 + state.expansion * 0.18 + wave * state.expansion * 0.028;
        const orbitSweep = isOrbit ? Math.sin(time * 1.35 + seeds[index]) * 0.08 : 0;

        positions[offset] = basePositions[offset] * pulse + orbitSweep;
        positions[offset + 1] = basePositions[offset + 1] * pulse;
        positions[offset + 2] = basePositions[offset + 2] * pulse;
      }

      positionAttribute.needsUpdate = true;
      group.scale.setScalar(currentScale);
      group.rotation.x = currentRotationX * 0.18;
      group.rotation.y += 0.005 + state.spinBoost * 0.016 + currentRotationY * 0.004;
      group.rotation.z = Math.sin(time * 0.28) * 0.05;

      renderer.clearDepth();
      renderer.render(scene, camera);
      const recycledFrame = trailFrames.shift();
      const recycledContext = recycledFrame.getContext('2d');
      recycledContext.clearRect(0, 0, recycledFrame.width, recycledFrame.height);
      recycledContext.drawImage(renderer.domElement, 0, 0, recycledFrame.width, recycledFrame.height);
      trailFrames.push(recycledFrame);

      trailContext.clearRect(0, 0, trailCanvas.width, trailCanvas.height);
      trailContext.globalCompositeOperation = 'lighter';
      trailFrames.forEach((frame, index) => {
        trailContext.globalAlpha = createTrailFrameOpacity(index);
        trailContext.drawImage(frame, 0, 0, trailCanvas.width, trailCanvas.height);
      });
      trailContext.globalAlpha = 1;
      animationFrame = requestAnimationFrame(render);
    };

    resize();
    window.addEventListener('resize', resize);
    animationFrame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener('resize', resize);
      geometry.dispose();
      heartSprite.dispose();
      material.dispose();
      renderer.dispose();
      mount.removeChild(trailCanvas);
      mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div className="globe-stage" ref={mountRef} aria-label="手势控制的爱心粒子" />;
}
