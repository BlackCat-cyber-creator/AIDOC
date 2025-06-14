import { ThemeToggleButton } from './ThemeToggleButton';
import { AppIcon3D } from '../3d/AppIcon3D';

export function AppHeader() {
  return (
    <header className="py-4 mb-8 border-b border-border relative bg-gradient-to-r from-pink-300 to-blue-300 dark:from-dark-header-start dark:via-dark-header-middle dark:to-dark-header-end">
      <div className="container mx-auto flex items-center justify-center gap-x-2">
        <h1 className="text-9xl font-headline font-semibold text-primary">&nbsp;AI</h1>
        <div className="flex justify-center items-center">
          <AppIcon3D modelPath="/models/app_icon.glb" scale={0.8} position={[0, -0.6, 0]} rotation={[-Math.PI / 16, Math.PI / 16, 0]} />
        </div>
        <h1 className="text-8xl font-headline font-semibold text-primary">DOC</h1>
      </div>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 md:right-8">
        <ThemeToggleButton />
      </div>
    </header>
  );
}
