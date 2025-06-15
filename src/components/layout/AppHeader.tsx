import { AppIcon3D } from '../3d/AppIcon3D';
import { ModeToggle } from '../mode-toggle';
import { useIsMobile } from '@/hooks/use-mobile';

export function AppHeader() {
  const isMobile = useIsMobile();
  return (
    <header className="py-4 mb-8 border-b border-border relative bg-gradient-to-r from-pink-300 to-blue-300 dark:from-dark-header-start dark:via-dark-header-middle dark:to-dark-header-end">
      <div className="container mx-auto flex items-center justify-center gap-x-2">
        <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-headline font-semibold text-primary">
          &nbsp;AI
        </h1>
        <div className="flex justify-center items-center h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 lg:h-40 lg:w-40">
          <AppIcon3D
            modelPath="/models/app_icon.glb"
            scale={isMobile ? 0.5 : 0.8}
            position={[0, -0.6, 0]}
            rotation={[-Math.PI / 16, Math.PI / 16, 0]}
          />
        </div>
        <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-headline font-semibold text-primary">DOC</h1>
      </div>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 md:right-8">
        <ModeToggle />
      </div>
    </header>
  );
}
