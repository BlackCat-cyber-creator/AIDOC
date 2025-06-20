import { AppIcon3D } from '../3d/AppIcon3D';
import { ModeToggle } from '../mode-toggle';
import { useIsMobile } from '@/hooks/use-mobile';

export function AppHeader() {
  const isMobile = useIsMobile();
  return (
    <header className="py-0 mb-6 border-b border-border relative bg-gradient-to-r from-pink-300 to-blue-300 dark:from-dark-header-start dark:via-dark-header-middle dark:to-dark-header-end">
      <div className="container mx-auto flex items-center justify-center gap-x-2 px-4 h-21 sm:h-25 md:h-29 lg:h-33">
        <h1 className="leading-none">
          <img src="/ai.png" alt="AI" className="h-20 sm:h-24 md:h-28 lg:h-36 w-auto" />
        </h1>
        <div className="flex justify-center items-center h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 lg:h-40 lg:w-40">
          <AppIcon3D
            modelPath="/models/app_icon.glb"
            scale={isMobile ? 0.5 : 0.8}
            position={isMobile ? [0, -0.5, 0] : [0, -0.7, 0]}
            rotation={[-Math.PI / 16, Math.PI / 16, 0]}
          />
        </div>
        <h1 className="leading-none">
          <img src="/doc.png" alt="DOC" className="h-28 sm:h-32 md:h-36 lg:h-44 w-auto" />
        </h1>
      </div>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 md:right-8 z-10">
        <ModeToggle />
      </div>
    </header>
  );
}
