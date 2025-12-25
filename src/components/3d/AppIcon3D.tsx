'use client';

import React, { Suspense, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';
import { Box3, Vector3, AnimationMixer, PerspectiveCamera } from 'three';

interface AppIcon3DProps {
  modelPath: string;
  scale?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  animate?: boolean;
}

function Model({ modelPath, animate }: { modelPath: string; animate?: boolean }) {
  const { scene, animations } = useGLTF(modelPath);
  const { camera } = useThree();
  const mixer = useRef<AnimationMixer | null>(null);

  useEffect(() => {
    if (animate && animations.length > 0 && scene) {
      mixer.current = new AnimationMixer(scene);
      animations.forEach((clip) => {
        mixer.current?.clipAction(clip).play();
      });
    }
    return () => {
      if (mixer.current) {
        mixer.current.stopAllAction();
      }
    };
  }, [animate, animations, scene]);

  useFrame((state, delta) => {
    if (mixer.current) {
      mixer.current.update(delta);
    }
  });

  // Auto-fit model to view
  useEffect(() => {
    if (scene && camera) {
      const box = new Box3().setFromObject(scene);
      const size = new Vector3();
      box.getSize(size);
      const center = new Vector3();
      box.getCenter(center);

      const maxDim = Math.max(size.x, size.y, size.z);

      if (camera instanceof PerspectiveCamera) {
        const fov = camera.fov * (Math.PI / 180);
        let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
        cameraZ *= 1.2; // Add some padding

        camera.position.set(center.x, center.y, center.z + cameraZ);
        camera.lookAt(center);
        camera.updateProjectionMatrix();

        // Adjust camera's Y position significantly downwards for a more direct view
        camera.position.y -= size.y * 0.5; // Increased adjustment to 50% of model's height
        camera.lookAt(center); // Re-point camera at center after adjustment
        camera.updateProjectionMatrix();
      } else {
        console.warn('Camera is not a PerspectiveCamera. Auto-fitting might not work as expected.', camera);
      }
    }
  }, [scene, camera]);

  return <primitive object={scene} />;
}

export function AppIcon3D({
  modelPath,
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  animate = true,
}: AppIcon3DProps) {
  return (
    <div className="w-64 h-64 sm:w-44 sm:h-44 md:w-48 md:h-48 lg:w-60 lg:h-60 flex items-center justify-center">
      <Canvas camera={{ fov: 75 }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[0, 0, 5]} intensity={1} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <spotLight position={[-10, 10, -10]} angle={0.15} penumbra={1} intensity={1} />
        <Suspense fallback={null}>
          <group scale={scale} position={position} rotation={rotation}>
            <Model modelPath={modelPath} animate={animate} />
          </group>
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 5}
            maxPolarAngle={(3 * Math.PI) / 5}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
