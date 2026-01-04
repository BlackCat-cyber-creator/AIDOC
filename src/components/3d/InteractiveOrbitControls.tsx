import React, { useRef, useEffect } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { Vector3 } from 'three';

interface InteractiveOrbitControlsProps {
  target: [number, number, number];
  initialCameraDistance: number | null;
}

export const InteractiveOrbitControls: React.FC<InteractiveOrbitControlsProps> = ({
  target,
  initialCameraDistance,
}) => {
  const controlsRef = useRef<any>();
  const { camera } = useThree();

  const prevDistanceRef = useRef<number | null>(null);
  const prevTargetRef = useRef<string>('');

  useEffect(() => {
    if (controlsRef.current && initialCameraDistance !== null) {
      const targetVec = new Vector3(...target);
      const targetStr = target.join(',');

      if (prevDistanceRef.current !== initialCameraDistance || prevTargetRef.current !== targetStr) {
        const direction = new Vector3().subVectors(camera.position, targetVec).normalize();

        if (direction.lengthSq() < 0.0001) {
          direction.set(0, 0, 1);
        }

        camera.position.copy(targetVec).add(direction.multiplyScalar(initialCameraDistance));
        controlsRef.current.target.copy(targetVec);

        // Ensure valid constraints
        const minDist = Math.min(0.2, initialCameraDistance * 0.5);

        controlsRef.current.minDistance = minDist;
        controlsRef.current.maxDistance = initialCameraDistance;

        controlsRef.current.update();

        prevDistanceRef.current = initialCameraDistance;
        prevTargetRef.current = targetStr;
      }
    }
  }, [initialCameraDistance, target[0], target[1], target[2], camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      panSpeed={1.5}
      enableZoom={true}
      makeDefault
      minPolarAngle={0}
      maxPolarAngle={Math.PI}
      minDistance={0.1}
      maxDistance={initialCameraDistance || 100}
    />
  );
};
