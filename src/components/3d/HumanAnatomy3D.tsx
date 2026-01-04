'use client';

import React, { Suspense, useRef, useEffect, useState, useCallback, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, Html } from '@react-three/drei';
import { Box3, Vector3, AnimationMixer, PerspectiveCamera, Mesh, MeshStandardMaterial, Object3D } from 'three';
import { InteractiveOrbitControls } from './InteractiveOrbitControls';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

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
  { id: 'head', label: 'head', center: [0, 1.8, 0], radius: 0.13 },
  { id: 'neck', label: 'neck', center: [0, 1.6, -0.015], radius: 0.08 },
  { id: 'chest', label: 'chest', center: [0, 1.45, 0.1], radius: 0.15 },
  { id: 'abdomen', label: 'abdomen', center: [0, 1.2, 0.1], radius: 0.15 },
  { id: 'pelvis', label: 'pelvis', center: [0, 1, 0], radius: 0.2 },
  { id: 'left-shoulder', label: 'left_shoulder', center: [0.25, 1.5, 0], radius: 0.15 },
  { id: 'right-shoulder', label: 'right_shoulder', center: [-0.25, 1.5, 0], radius: 0.15 },
  { id: 'left-arm', label: 'left_arm', center: [0.55, 1.5, 0], radius: 0.17 },
  { id: 'right-arm', label: 'right_arm', center: [-0.55, 1.5, 0], radius: 0.17 },
  { id: 'left-hand', label: 'left_hand', center: [0.8, 1.5, 0], radius: 0.1 },
  { id: 'right-hand', label: 'right_hand', center: [-0.8, 1.5, 0], radius: 0.1 },
  { id: 'left-leg', label: 'left_leg', center: [0.15, 0.4, 0], radius: 0.2 },
  { id: 'right-leg', label: 'right_leg', center: [-0.15, 0.4, 0], radius: 0.2 },
  { id: 'left-foot', label: 'left_foot', center: [0.1, 0.1, 0.1], radius: 0.1 },
  { id: 'right-foot', label: 'right_foot', center: [-0.1, 0.1, 0.1], radius: 0.1 },
  { id: 'back', label: 'back', center: [0, 1.35, -0.1], radius: 0.2 },
  { id: 'genitals-male', label: 'genitals_male', center: [0, 0.85, 0.1], radius: 0.1, sex: 'male' },
];

export const femaleBodyRegions: BodyPart[] = [
  { id: 'head', label: 'head', center: [0, 1.65, 0], radius: 0.11 },
  { id: 'neck', label: 'neck', center: [0, 1.5, -0.01], radius: 0.07 },
  { id: 'chest', label: 'chest', center: [0, 1.35, 0.03], radius: 0.14 },
  { id: 'abdomen', label: 'abdomen', center: [0, 1.1, 0.08], radius: 0.13 },
  { id: 'pelvis', label: 'pelvis', center: [0, 1, 0], radius: 0.16 },
  { id: 'left-shoulder', label: 'left_shoulder', center: [0.22, 1.4, 0], radius: 0.12 },
  { id: 'right-shoulder', label: 'right_shoulder', center: [-0.22, 1.4, 0], radius: 0.12 },
  { id: 'left-arm', label: 'left_arm', center: [0.5, 1.4, 0], radius: 0.15 },
  { id: 'right-arm', label: 'right_arm', center: [-0.5, 1.4, 0], radius: 0.15 },
  { id: 'left-hand', label: 'left_hand', center: [0.75, 1.4, 0], radius: 0.08 },
  { id: 'right-hand', label: 'right_hand', center: [-0.75, 1.4, 0], radius: 0.08 },
  { id: 'left-leg', label: 'left_leg', center: [0.15, 0.4, 0], radius: 0.15 },
  { id: 'right-leg', label: 'right_leg', center: [-0.15, 0.4, 0], radius: 0.15 },
  { id: 'left-foot', label: 'left_foot', center: [0.1, 0.1, 0.03], radius: 0.08 },
  { id: 'right-foot', label: 'right_foot', center: [-0.1, 0.1, 0.03], radius: 0.08 },
  { id: 'back', label: 'back', center: [0, 1.25, -0.1], radius: 0.18 },
  { id: 'breast', label: 'breast', center: [0, 1.3, 0.13], radius: 0.1, sex: 'female' },
  { id: 'genitals-female', label: 'genitals_female', center: [0, 0.85, 0], radius: 0.08, sex: 'female' },
];

const AnatomyModel = React.memo(
  ({ modelPath, onModelLoaded }: { modelPath: string; onModelLoaded: (center: Vector3, distance: number) => void }) => {
    const { scene: gltfScene, animations } = useGLTF(modelPath);
    const { camera, size } = useThree();
    const mixer = useRef<AnimationMixer | null>(null);

    const clonedScene = useMemo(() => {
      const clone = gltfScene.clone();
      clone.position.y -= 1;

      clone.traverse((child: Object3D) => {
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
      return clone;
    }, [gltfScene]);

    useEffect(() => {
      if (clonedScene) {
        const box = new Box3().setFromObject(clonedScene);
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

          distance *= 1.3;
          onModelLoaded(center, distance);
        }
      }
    }, [clonedScene, camera, onModelLoaded, size]);

    useEffect(() => {
      if (animations.length > 0 && clonedScene) {
        mixer.current = new AnimationMixer(clonedScene);
        animations.forEach((clip) => {
          mixer.current?.clipAction(clip).play();
        });
      }
      return () => {
        if (mixer.current) {
          mixer.current.stopAllAction();
          mixer.current = null;
        }
      };
    }, [animations, clonedScene]);

    useFrame((_state, delta) => {
      if (mixer.current) {
        mixer.current.update(delta);
      }
    });

    return <primitive object={clonedScene} />;
  }
);

AnatomyModel.displayName = 'AnatomyModel';

export const HumanAnatomy3D = React.memo(
  ({ selectedSex, selectedLocations, onLocationToggle, disabled = false }: HumanAnatomy3DProps) => {
    const { t } = useTranslation();
    const modelPath = selectedSex === 'male' ? '/models/male_anatomy.glb' : '/models/female_anatomy.glb';
    const currentBodyRegions = selectedSex === 'male' ? maleBodyRegions : femaleBodyRegions;
    const filteredBodyRegions = useMemo(
      () => currentBodyRegions.filter((region) => !region.sex || region.sex === selectedSex),
      [currentBodyRegions, selectedSex]
    );

    const [cameraConfig, setCameraConfig] = useState<{ target: Vector3; distance: number } | null>(null);

    const handleModelLoaded = useCallback((center: Vector3, distance: number) => {
      setCameraConfig({ target: center, distance });
    }, []);

    const handleLocationToggle = useCallback(
      (locationValue: string) => {
        if (!disabled) {
          onLocationToggle(locationValue);
        }
      },
      [disabled, onLocationToggle]
    );

    useEffect(() => {
      useGLTF.preload('/models/male_anatomy.glb');
      useGLTF.preload('/models/female_anatomy.glb');
    }, []);

    return (
      <div className="w-full h-[45vh] min-h-[300px] max-h-[500px] md:h-[600px] flex items-center justify-center relative bg-muted/5 rounded-xl overflow-hidden border">
        <Canvas camera={{ fov: 75, position: [0, 0, 5] }} dpr={[1, 2]} gl={{ powerPreference: 'high-performance' }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[1, 2, 3]} intensity={0.8} />
          <pointLight position={[-2, 1, -2]} intensity={0.5} />
          <spotLight position={[0, 5, 0]} angle={0.3} penumbra={1} intensity={1} castShadow />
          <Suspense fallback={null}>
            <group>
              <AnatomyModel modelPath={modelPath} onModelLoaded={handleModelLoaded} />
              {cameraConfig && (
                <InteractiveOrbitControls
                  target={cameraConfig.target.toArray()}
                  initialCameraDistance={cameraConfig.distance}
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
                  onPointerOver={() => {
                    if (!disabled) document.body.style.cursor = 'pointer';
                  }}
                  onPointerOut={() => {
                    document.body.style.cursor = 'auto';
                  }}
                >
                  <sphereGeometry args={[part.radius, 32, 32]} />
                  <meshStandardMaterial
                    transparent
                    opacity={isSelected ? 0.4 : 0.1}
                    color={isSelected ? '#3b82f6' : '#64748b'}
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
                  position={[part.center[0], part.center[1] - 1.0, part.center[2]]}
                  center
                  style={{ pointerEvents: 'none' }}
                >
                  <div
                    className={cn(
                      'transition-all duration-200 select-none px-2 py-1 rounded-md whitespace-nowrap leading-none',
                      'text-[0.3rem] sm:text-[0.4rem] md:text-[0.5rem] font-semibold',
                      isSelected
                        ? 'bg-blue-600 text-white scale-110 shadow-lg'
                        : 'bg-slate-800/80 text-slate-200 opacity-70'
                    )}
                  >
                    <button
                      className="w-full h-full focus:outline-none active:outline-none bg-transparent border-none p-0 outline-none ring-0 focus:ring-0 active:ring-0 select-none"
                      tabIndex={-1}
                      style={{ pointerEvents: 'auto', cursor: 'pointer', outline: 'none' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        handleLocationToggle(part.id);
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      {t(part.label)}
                    </button>
                  </div>
                </Html>
              );
            })}
          </Suspense>
        </Canvas>
        {disabled && <div className="absolute inset-0 z-10 bg-background/20 backdrop-blur-[1px] cursor-not-allowed" />}
      </div>
    );
  }
);

HumanAnatomy3D.displayName = 'HumanAnatomy3D';
