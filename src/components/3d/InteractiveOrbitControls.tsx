import React, { useRef, useEffect, useState } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber';
import { Vector3 } from 'three';

interface InteractiveOrbitControlsProps {
  target: [number, number, number];
  initialCameraDistance: number | null;
}

export const InteractiveOrbitControls: React.FC<InteractiveOrbitControlsProps> = ({
  target,
  initialCameraDistance,
}) => {
  const controlsRef = useRef<any>(); // OrbitControls type
  const { camera } = useThree();

  useEffect(() => {
    if (controlsRef.current && initialCameraDistance !== null) {
      // Set zoom limits: cannot zoom out past initial distance, and limit how much it can zoom in.
      controlsRef.current.minDistance = initialCameraDistance * 0.5; // Allow zooming in to 50% of initial distance
      controlsRef.current.maxDistance = initialCameraDistance; // Cannot zoom out past initial view
      controlsRef.current.update();
    }
  }, [initialCameraDistance]);

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      target={new Vector3(...target)}
      minPolarAngle={Math.PI / 2 - 0.2} // Allow some vertical rotation upwards
      maxPolarAngle={Math.PI / 2 + 0.2} // Allow some vertical rotation downwards
    />
  );
};
