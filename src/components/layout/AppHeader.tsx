import { AppIcon3D } from '../3d/AppIcon3D';
import { ModeToggle } from '../mode-toggle';
import { useIsMobile } from '@/hooks/use-mobile';
import Iridescence from '../Iridescence';
import LiquidChrome from '../LiquidChrome';
import { useTheme } from "next-themes";

export function AppHeader() {
  const isMobile = useIsMobile();
  const { theme } = useTheme();

  return (
    <header className="py-0 mb-6 border-b border-border relative h-21 sm:h-25 md:h-29 lg:h-33">
      <div className="absolute inset-0 z-0">
        {theme === "light" ? (
          <Iridescence
            color={[1, 0.9, 0.9]}
            mouseReact={false}
            amplitude={0}
            speed={0.5}
            horizontalStretch={0.5}
          />
        ) : (
          <LiquidChrome
            baseColor={[0.15, 0.1, 0.3]}
            speed={0.6}
            amplitude={0.3}
            interactive={false}
            horizontalStretch={0.4}
          />
        )}
      </div>
      <div className="container mx-auto flex items-center justify-center gap-x-2 px-4 h-full relative z-10">
        <h1 className="leading-none">
          <img src="/ai.webp" alt="AI" className="h-20 sm:h-24 md:h-28 lg:h-36 w-auto" />
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
          <img src="/doc.webp" alt="DOC" className="h-28 sm:h-32 md:h-36 lg:h-44 w-auto" />
        </h1>
      </div>
      <div className="absolute right-2 top-1/2 -translate-y-1/2 md:right-8 z-20">
        <ModeToggle />
      </div>
    </header>
  );
}
