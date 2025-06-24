'use client';

import React, { Suspense, useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Html } from '@react-three/drei';
import {
  Box3,
  Vector3,
  AnimationMixer,
  PerspectiveCamera,
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,
  Group,
  Object3D,
} from 'three';
import { InteractiveOrbitControls } from './InteractiveOrbitControls';

interface HumanAnatomy3DProps {
  selectedSex: 'male' | 'female' | 'other';
  selectedLocations: string[];
  onLocationToggle: (locationValue: string) => void;
  disabled?: boolean;
}

interface BodyPart {
  id: string;
  label: string;
  center: [number, number, number];
  radius: number;
  sex?: 'male' | 'female';
}

export const maleBodyRegions: BodyPart[] = [
  { id: 'head', label: 'Head', center: [0, 1.8, 0], radius: 0.13 },
  { id: 'neck', label: 'Neck', center: [0, 1.6, -0.015], radius: 0.08 },
  { id: 'chest', label: 'Chest', center: [0, 1.45, 0.1], radius: 0.15 },
  { id: 'abdomen', label: 'Abdomen', center: [0, 1.2, 0.1], radius: 0.15 },
  { id: 'pelvis', label: 'Pelvis', center: [0, 1, 0], radius: 0.2 },
  { id: 'left-shoulder', label: 'L. Shoulder', center: [0.25, 1.5, 0], radius: 0.15 },
  { id: 'right-shoulder', label: 'R. Shoulder', center: [-0.25, 1.5, 0], radius: 0.15 },
  { id: 'left-arm', label: 'L. Arm', center: [0.55, 1.5, 0], radius: 0.17 },
  { id: 'right-arm', label: 'R. Arm', center: [-0.55, 1.5, 0], radius: 0.17 },
  { id: 'left-hand', label: 'L. Hand', center: [0.8, 1.5, 0], radius: 0.1 },
  { id: 'right-hand', label: 'R. Hand', center: [-0.8, 1.5, 0], radius: 0.1 },
  { id: 'left-leg', label: 'L. Leg', center: [0.15, 0.4, 0], radius: 0.2 },
  { id: 'right-leg', label: 'R. Leg', center: [-0.15, 0.4, 0], radius: 0.2 },
  { id: 'left-foot', label: 'L. Foot', center: [0.1, 0.1, 0.1], radius: 0.1 },
  { id: 'right-foot', label: 'R. Foot', center: [-0.1, 0.1, 0.1], radius: 0.1 },
  { id: 'back', label: 'Back', center: [0, 1.35, -0.1], radius: 0.2 },
  { id: 'genitals-male', label: 'Genitals (Male)', center: [0, 0.85, 0.1], radius: 0.1, sex: 'male' },
];

export const femaleBodyRegions: BodyPart[] = [
  { id: 'head', label: 'Head', center: [0, 1.65, 0], radius: 0.11 },
  { id: 'neck', label: 'Neck', center: [0, 1.5, -0.01], radius: 0.07 },
  { id: 'chest', label: 'Chest', center: [0, 1.35, 0.03], radius: 0.14 },
  { id: 'abdomen', label: 'Abdomen', center: [0, 1.1, 0.08], radius: 0.13 },
  { id: 'pelvis', label: 'Pelvis', center: [0, 1, 0], radius: 0.16 },
  { id: 'left-shoulder', label: 'L. Shoulder', center: [0.22, 1.4, 0], radius: 0.12 },
  { id: 'right-shoulder', label: 'R. Shoulder', center: [-0.22, 1.4, 0], radius: 0.12 },
  { id: 'left-arm', label: 'L. Arm', center: [0.5, 1.4, 0], radius: 0.15 },
  { id: 'right-arm', label: 'R. Arm', center: [-0.5, 1.4, 0], radius: 0.15 },
  { id: 'left-hand', label: 'L. Hand', center: [0.75, 1.4, 0], radius: 0.08 },
  { id: 'right-hand', label: 'R. Hand', center: [-0.75, 1.4, 0], radius: 0.08 },
  { id: 'left-leg', label: 'L. Leg', center: [0.15, 0.4, 0], radius: 0.15 },
  { id: 'right-leg', label: 'R. Leg', center: [-0.15, 0.4, 0], radius: 0.15 },
  { id: 'left-foot', label: 'L. Foot', center: [0.1, 0.1, 0.03], radius: 0.08 },
  { id: 'right-foot', label: 'R. Foot', center: [-0.1, 0.1, 0.03], radius: 0.08 },
  { id: 'back', label: 'Back', center: [0, 1.25, -0.1], radius: 0.18 },
  { id: 'breast', label: 'Breast', center: [0, 1.3, 0.13], radius: 0.1, sex: 'female' },
  { id: 'genitals-female', label: 'Genitals (Female)', center: [0, 0.85, 0], radius: 0.08, sex: 'female' },
];

const AnatomyModel = React.memo(
  ({
    modelPath,
    bodyRegions,
    onModelLoaded,
  }: {
    modelPath: string;
    bodyRegions: BodyPart[];
    onModelLoaded: (center: Vector3, distance: number) => void;
  }) => {
    const { scene: gltfScene, animations } = useGLTF(modelPath);
    const { camera, size } = useThree();
    const mixer = useRef<AnimationMixer | null>(null);

    const clonedScene = useRef<Group | null>(null);
    useEffect(() => {
      if (gltfScene && !clonedScene.current) {
        clonedScene.current = gltfScene.clone();
        clonedScene.current.position.y -= 1;

        clonedScene.current.traverse((child: Object3D) => {
          if (child instanceof Mesh) {
            const material = child.material;
            if (Array.isArray(material)) {
              material.forEach((mat: MeshStandardMaterial) => {
                mat.clippingPlanes = [];
                mat.needsUpdate = true;
              });
            } else if (material) {
              (material as MeshStandardMaterial).clippingPlanes = [];
              (material as MeshStandardMaterial).needsUpdate = true;
            }
          }
        });

        const box = new Box3().setFromObject(clonedScene.current);
        const center = new Vector3();
        box.getCenter(center);

        let distance = 0;
        if (camera instanceof PerspectiveCamera) {
          const sizeVec = new Vector3();
          box.getSize(sizeVec);

          const objectSize = Math.max(sizeVec.x, sizeVec.y, sizeVec.z);
          const fovRad = (Math.PI * camera.fov) / 360;
          distance = objectSize / 2 / Math.tan(fovRad);

          const aspectRatio = size.width / size.height;
          if (sizeVec.x / aspectRatio > sizeVec.y) {
            distance = sizeVec.x / (2 * aspectRatio) / Math.tan(fovRad);
          }

          distance *= 1.6;
          onModelLoaded(center, distance);
        }
      }
    }, [gltfScene, camera, onModelLoaded, size]);

    useEffect(() => {
      if (animations.length > 0 && clonedScene.current) {
        mixer.current = new AnimationMixer(clonedScene.current);
        animations.forEach((clip) => {
          mixer.current?.clipAction(clip).play();
        });
      }
      return () => {
        if (mixer.current) {
          mixer.current.stopAllAction();
        }
      };
    }, [animations]);

    useFrame((state, delta) => {
      if (mixer.current) {
        mixer.current.update(delta);
      }
    });

    return <primitive object={clonedScene.current || gltfScene} />;
  }
);

AnatomyModel.displayName = 'AnatomyModel';

export const HumanAnatomy3D = React.memo(
  ({ selectedSex, selectedLocations, onLocationToggle, disabled = false }: HumanAnatomy3DProps) => {
    const modelPath = selectedSex === 'male' ? '/models/male_anatomy.glb' : '/models/female_anatomy.glb';
    const currentBodyRegions = selectedSex === 'male' ? maleBodyRegions : femaleBodyRegions;
    const filteredBodyRegions = currentBodyRegions.filter((region) => !region.sex || region.sex === selectedSex);

    const [initialCameraTarget, setInitialCameraTarget] = useState<Vector3 | null>(null);
    const [initialCameraDistance, setInitialCameraDistance] = useState<number | null>(null);

    const handleModelLoaded = useCallback((center: Vector3, distance: number) => {
      setInitialCameraTarget(center);
      setInitialCameraDistance(distance);
    }, []);

    const handleLocationToggle = useCallback(
      (locationValue: string) => {
        if (!disabled) {
          onLocationToggle(locationValue);
        }
      },
      [disabled, onLocationToggle]
    );

    return (
      <div className="w-full h-[40vh] min-h-[250px] max-h-[400px] md:h-[500px] flex items-center justify-center relative">
        <Canvas camera={{ fov: 90 }}>
          <ambientLight intensity={0.8} />
          <directionalLight position={[0, 0, 5]} intensity={1} />
          <pointLight position={[10, 10, 10]} intensity={1} />
          <spotLight position={[-10, 10, -10]} angle={0.15} penumbra={1} intensity={1} />
          <Suspense fallback={null}>
            <group>
              <AnatomyModel modelPath={modelPath} bodyRegions={filteredBodyRegions} onModelLoaded={handleModelLoaded} />
              {initialCameraTarget && initialCameraDistance !== null && (
                <InteractiveOrbitControls
                  target={initialCameraTarget.toArray()}
                  initialCameraDistance={initialCameraDistance}
                />
              )}
            </group>
            {filteredBodyRegions.map((part) => {
              const isSelected = selectedLocations.includes(part.id);
              return (
                <mesh
                  key={part.id + '-mesh'}
                  position={[part.center[0], part.center[1] - 1.0, part.center[2]]}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLocationToggle(part.id);
                  }}
                >
                  <sphereGeometry args={[part.radius, 32, 32]} />
                  <meshStandardMaterial
                    transparent
                    opacity={isSelected ? 0.35 : 0.15}
                    color={isSelected ? '#2563eb' : '#888'}
                    depthWrite={false}
                  />
                </mesh>
              );
            })}
            {filteredBodyRegions.map((part) => {
              const isSelected = selectedLocations.includes(part.id);
              return (
                <Html
                  key={part.id + '-label'}
                  position={[part.center[0], part.center[1] - 1.0 + 0.1, part.center[2]]}
                  center
                  style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                  className={`text-[0.2rem] sm:text-[0.3rem] md:text-[0.4rem] font-semibold px-1 py-0 rounded-md whitespace-nowrap select-none w-max leading-none
                  ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-700 text-white bg-opacity-70'}
                `}
                >
                  <button
                    className="relative w-full h-full focus:outline-none active:outline-none border-none focus:ring-0 focus:ring-offset-0 shadow-none"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLocationToggle(part.id);
                    }}
                  >
                    {part.label}
                  </button>
                </Html>
              );
            })}
          </Suspense>
        </Canvas>
      </div>
    );
  }
);

HumanAnatomy3D.displayName = 'HumanAnatomy3D';
