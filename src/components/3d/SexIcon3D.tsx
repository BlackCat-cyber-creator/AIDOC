import * as React from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls } from '@react-three/drei';
import { AnimationMixer } from 'three';
import { Suspense } from 'react';

interface SexIcon3DProps {
  modelPath: string;
  scale?: number;
  className?: string;
  animate?: boolean;
  position?: [number, number, number];
}

export function SexIcon3D({
  modelPath,
  scale = 1.3,
  className = 'w-36 h-36',
  animate = false,
  position = [0, 0, 0],
}: SexIcon3DProps) {
  function Model() {
    const { scene, animations }: any = useGLTF(modelPath);
    const mixer = React.useRef<AnimationMixer | null>(null);
    React.useEffect(() => {
      if (animate && animations && animations.length > 0 && scene) {
        mixer.current = new AnimationMixer(scene);
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
  }
  return (
    <div className={className + ' flex items-center justify-center'}>
      <Canvas camera={{ fov: 55, position: [0, 2, 3] }}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[0, 0, 5]} intensity={1} />
        <Suspense fallback={null}>
          <group scale={scale} position={position}>
            <Model />
          </group>
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 5} // Allow rotation down to 45 degrees from top pole
            maxPolarAngle={(3 * Math.PI) / 5} // Allow rotation up to 45 degrees from bottom pole
            target={[0, 0.8, 0]} // Ensure the camera targets the model correctly
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
