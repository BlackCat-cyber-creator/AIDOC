import * as React from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';
import { AnimationMixer, Group } from 'three';
import { Suspense } from 'react';

interface ModelProps {
  modelPath: string;
  animate: boolean;
}

const Model = React.memo(({ modelPath, animate }: ModelProps) => {
  const { scene, animations } = useGLTF(modelPath) as any;
  const mixer = React.useRef<AnimationMixer | null>(null);

  React.useEffect(() => {
    if (animate && animations && animations.length > 0 && scene) {
      mixer.current = new AnimationMixer(scene as Group);
      animations.forEach((clip: any) => {
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
    if (mixer.current && animate) {
      mixer.current.update(delta);
    }
  });

  return <primitive object={scene} />;
});

Model.displayName = 'Model';

interface SexIcon3DProps {
  modelPath: string;
  scale?: number;
  className?: string;
  animate?: boolean;
  position?: [number, number, number];
}

export const SexIcon3D = React.memo(
  ({ modelPath, scale = 1.3, className = 'w-36 h-36', animate = false, position = [0, 0, 0] }: SexIcon3DProps) => {
    return (
      <div className={className + ' flex items-center justify-center'}>
        <Canvas camera={{ fov: 55, position: [0, 2, 3] }}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[0, 0, 5]} intensity={1} />
          <Suspense fallback={null}>
            <group scale={scale} position={position}>
              <Model modelPath={modelPath} animate={animate} />
            </group>
            <OrbitControls
              enableZoom={false}
              enablePan={false}
              minPolarAngle={Math.PI / 5}
              maxPolarAngle={(3 * Math.PI) / 5}
              target={[0, 0.8, 0]}
            />
          </Suspense>
        </Canvas>
      </div>
    );
  }
);

SexIcon3D.displayName = 'SexIcon3D';
