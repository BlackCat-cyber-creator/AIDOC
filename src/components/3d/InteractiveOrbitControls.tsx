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

  useEffect(() => {
    if (controlsRef.current && initialCameraDistance !== null) {
      controlsRef.current.minDistance = initialCameraDistance * 0.4;
      controlsRef.current.maxDistance = initialCameraDistance * 1.5;

      // Reset camera position to look at target from a good distance if it's the first load
      const targetVec = new Vector3(...target);
      const direction = new Vector3(0, 0, 1).applyQuaternion(camera.quaternion);
      camera.position.copy(targetVec).add(direction.multiplyScalar(initialCameraDistance));

      controlsRef.current.target.copy(targetVec);
      controlsRef.current.update();
    }
  }, [initialCameraDistance, target, camera]);

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={false} // Disable panning to keep model centered
      enableZoom={true}
      makeDefault
      minPolarAngle={0}
      maxPolarAngle={Math.PI}
      rotateSpeed={0.8}
      zoomSpeed={1.2}
    />
  );
};
