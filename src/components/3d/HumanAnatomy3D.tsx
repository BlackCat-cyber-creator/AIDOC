'use client';

import React, { Suspense, useRef, useEffect, useState, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, OrbitControls, Html } from '@react-three/drei';
import { Box3, Vector3, AnimationMixer, PerspectiveCamera, Mesh, MeshStandardMaterial, SphereGeometry, Group, Object3D } from 'three';

interface HumanAnatomy3DProps {
  selectedSex: 'male' | 'female' | 'other';
  selectedLocations: string[];
  onLocationToggle: (locationValue: string) => void;
  disabled?: boolean;
}

interface BodyPart {
  id: string;
  label: string;
  center: [number, number, number]; // Approximate center of the body part in 3D space
  radius: number; // Approximate radius for clickable area detection
  sex?: 'male' | 'female'; // Optional: for sex-specific regions
}

// Define body regions with approximate coordinates (these will likely need fine-tuning based on your GLB)
const maleBodyRegions: BodyPart[] = [
  // General regions (unisex)
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
  { id: 'back', label: 'Back', center: [0, 1.35, -0.1], radius: 0.2 }, // Slightly behind for back
  { id: 'genitals-male', label: 'Genitals (Male)', center: [0, 0.85, 0.1], radius: 0.1, sex: 'male' },
];

const femaleBodyRegions: BodyPart[] = [
    // General regions (unisex)
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
    { id: 'back', label: 'Back', center: [0, 1.25, -0.1], radius: 0.18 }, // Slightly behind for back
  { id: 'breast', label: 'Breast', center: [0, 1.3, 0.13], radius: 0.1, sex: 'female' },
  { id: 'genitals-female', label: 'Genitals (Female)', center: [0, 0.85, 0], radius: 0.08, sex: 'female' },
];

function AnatomyModel({
  modelPath,
  selectedLocations,
  onLocationToggle,
  disabled,
  selectedSex,
  bodyRegions,
  onModelLoaded,
}: {
  modelPath: string;
  selectedLocations: string[];
  onLocationToggle: (locationValue: string) => void;
  disabled?: boolean;
  selectedSex: 'male' | 'female' | 'other';
  bodyRegions: BodyPart[];
  onModelLoaded: (center: Vector3) => void;
}) {
  const { scene: gltfScene, animations } = useGLTF(modelPath);
  const { camera, raycaster, mouse, size } = useThree();
  const mixer = useRef<AnimationMixer | null>(null);
  const modelRef = useRef<Mesh | null>(null);

  // Clone the scene once and apply initial clipping
  const clonedScene = useRef<Group | null>(null);
  useEffect(() => {
    if (gltfScene && !clonedScene.current) {
      clonedScene.current = gltfScene.clone();
      clonedScene.current.position.y -= 1; // Directly shift the model even further downwards

      // Remove all previous clipping plane debug settings and apply standard material if necessary
      clonedScene.current.traverse((child: Object3D) => {
        if (child instanceof Mesh) {
          const material = child.material;
          if (Array.isArray(material)) {
            material.forEach((mat: MeshStandardMaterial) => {
              mat.clippingPlanes = []; // Ensure no clipping planes remain
              mat.needsUpdate = true;
            });
          } else if (material) {
            (material as MeshStandardMaterial).clippingPlanes = []; // Ensure no clipping planes remain
            (material as MeshStandardMaterial).needsUpdate = true;
          }
        }
      });

      // Calculate center and call the callback
      const box = new Box3().setFromObject(clonedScene.current);
      const center = new Vector3();
      box.getCenter(center);
      if (onModelLoaded) {
        onModelLoaded(center);
      }

      // Initial camera setup (still need this for initial view, but without `OrbitControls` manipulation)
      if (camera instanceof PerspectiveCamera) {
        const sizeVec = new Vector3();
        box.getSize(sizeVec);

        // Calculate camera distance to fit the entire model
        const objectSize = Math.max(sizeVec.x, sizeVec.y, sizeVec.z);
        const fovRad = Math.PI * camera.fov / 360;
        let distance = (objectSize / 2) / Math.tan(fovRad);
        
        // Adjust distance for aspect ratio if necessary, prioritizing vertical fit
        const aspectRatio = size.width / size.height;
        if (sizeVec.x / aspectRatio > sizeVec.y) {
          distance = (sizeVec.x / (2 * aspectRatio)) / Math.tan(fovRad);
        }

        distance *= 1.6; // Add padding to the distance for better framing

        // Set camera position relative to the adjusted center
        camera.position.set(center.x, center.y, center.z + distance);
        camera.lookAt(center); // Look at the adjusted center
        camera.updateProjectionMatrix();
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
  }, [animations, clonedScene.current]);

  useFrame((state, delta) => {
    if (mixer.current) {
      mixer.current.update(delta);
    }
  });

  const handleClick = (event: any) => {
    if (disabled || !modelRef.current) return;

    // Update the mouse variable with the mouse position
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the raycaster with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersecting the raycaster
    const intersects = raycaster.intersectObjects(clonedScene.current ? clonedScene.current.children : [], true); // Use clonedScene

    if (intersects.length > 0) {
      // Get the first intersected object (closest to camera)
      const intersectionPoint = intersects[0].point;

      // Determine which body region was clicked based on coordinates
      const clickedRegion = bodyRegions.find(region => {
        const regionCenter = new Vector3(...region.center);
        return intersectionPoint.distanceTo(regionCenter) < region.radius;
      });

      if (clickedRegion) {
        onLocationToggle(clickedRegion.id);
      }
    }
  };

  // Attach event listener to the canvas (or the model directly if possible within Drei)
  useEffect(() => {
    const canvas = document.querySelector('canvas');
    if (canvas) {
      canvas.addEventListener('click', handleClick);
      return () => canvas.removeEventListener('click', handleClick);
    }
  }, [handleClick]);

  return <primitive object={clonedScene.current || gltfScene} ref={modelRef} />;
}

export function HumanAnatomy3D({
  selectedSex,
  selectedLocations,
  onLocationToggle,
  disabled = false,
}: HumanAnatomy3DProps) {
  const modelPath = selectedSex === 'male' ? '/models/male_anatomy.glb' : '/models/female_anatomy.glb';

  // Select the appropriate body regions based on selected sex
  const currentBodyRegions = selectedSex === 'male' ? maleBodyRegions : femaleBodyRegions;

  // Filter body regions based on selected sex (this will now filter the currentBodyRegions)
  const filteredBodyRegions = currentBodyRegions.filter(
    (region) => !region.sex || region.sex === selectedSex
  );

  const [initialCameraTarget, setInitialCameraTarget] = useState<Vector3 | null>(null);

  const handleModelLoaded = useCallback((center: Vector3) => {
    setInitialCameraTarget(center);
  }, []);

  return (
    <div className="w-full h-[500px] flex items-center justify-center relative">
      <Canvas
        camera={{ fov: 90 }}
        onPointerMissed={() => { /* Handle clicks outside model if needed */ }}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[0, 0, 5]} intensity={1} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <spotLight position={[-10, 10, -10]} angle={0.15} penumbra={1} intensity={1} />
        <Suspense fallback={null}>
          <group>
            <AnatomyModel
              modelPath={modelPath}
              selectedLocations={selectedLocations}
              onLocationToggle={onLocationToggle}
              disabled={disabled}
              selectedSex={selectedSex}
              bodyRegions={currentBodyRegions}
              onModelLoaded={handleModelLoaded}
            />
          </group>
          {initialCameraTarget && (
            <OrbitControls 
              enableZoom={false} 
              enablePan={false} 
              minPolarAngle={Math.PI / 2} 
              maxPolarAngle={Math.PI / 2} 
              target={initialCameraTarget}
            />
          )}
          {/* Clickable regions */}
          {filteredBodyRegions.map((part) => {
            const isSelected = selectedLocations.includes(part.id);
            return (
              <mesh
                key={part.id + '-mesh'}
                position={[part.center[0], part.center[1] - 1.0, part.center[2]]}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!disabled) onLocationToggle(part.id);
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
          {/* Render Labels as HTML overlays INSIDE Canvas, now clickable */}
          {filteredBodyRegions.map((part) => {
            const isSelected = selectedLocations.includes(part.id);
            return (
              <Html
                key={part.id + '-label'}
                position={[part.center[0], part.center[1] - 1.0 + 0.1, part.center[2]]}
                center
                style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                className={`text-[0.4rem] font-semibold px-2 py-1 rounded-full whitespace-nowrap select-none
                  ${isSelected ? 'bg-blue-500 text-white' : 'bg-gray-700 text-white bg-opacity-70'}
                `}
                onClick={(e) => {
                  e.stopPropagation();
                  if (!disabled) onLocationToggle(part.id);
                }}
              >
                <div className="relative">
                  {part.label}
                </div>
              </Html>
            );
          })}
        </Suspense>
      </Canvas>
    </div>
  );
} 