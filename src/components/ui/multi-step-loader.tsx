import * as React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const loaderVariants = {
  states: {
    0: 'w-0',
    1: 'w-1/6',
    2: 'w-1/3',
    3: 'w-1/2',
    4: 'w-2/3',
    5: 'w-5/6',
    6: 'w-full',
  },
};

interface MultiStepLoaderProps {
  loadingStates: { text: string }[];
  loading?: boolean;
  duration?: number;
  loop?: boolean;
}

export const MultiStepLoader = ({ loadingStates, loading, duration = 2000, loop = true }: MultiStepLoaderProps) => {
  const [currentState, setCurrentState] = React.useState(0);

  React.useEffect(() => {
    if (!loading) {
      setCurrentState(0);
      return;
    }
    const timeout = setTimeout(() => {
      setCurrentState((prevState) =>
        loop
          ? prevState === loadingStates.length - 1
            ? 0
            : prevState + 1
          : Math.min(prevState + 1, loadingStates.length - 1)
      );
    }, duration);

    return () => clearTimeout(timeout);
  }, [currentState, loading, loop, loadingStates.length, duration]);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex h-full w-full items-center justify-center backdrop-blur-2xl bg-background/80">
      <div className="h-96 relative w-full max-w-lg flex flex-col items-center justify-center p-8">
        {/* Animated Icon */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
          <Loader2 className="h-16 w-16 text-primary animate-spin relative z-10" />
        </div>

        <div className="w-full space-y-4 relative">
          {loadingStates.map((state, index) => {
            const distance = Math.abs(index - currentState);
            const opacity = Math.max(1 - distance * 0.2, 0); // Fade out distant items

            return (
              <div
                key={index}
                className={cn(
                  'text-center transition-all duration-500 ease-in-out transform',
                  index === currentState
                    ? 'text-2xl font-bold text-primary scale-110 opacity-100 blur-0 translate-y-0'
                    : 'text-lg text-muted-foreground scale-95 blur-sm',
                  index < currentState ? '-translate-y-4 opacity-0' : '', // Move past items up and hide
                  index > currentState ? 'translate-y-4 opacity-40' : '' // Future items down and dim
                )}
                style={{
                  // Only show current, previous, and next items to keep layout clean
                  display: Math.abs(index - currentState) > 1 ? 'none' : 'block',
                }}
              >
                {state.text}
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        <div className="w-64 h-1.5 bg-muted rounded-full mt-10 overflow-hidden relative">
          <div
            className="absolute inset-y-0 left-0 bg-primary transition-all duration-500 ease-out"
            style={{ width: `${((currentState + 1) / loadingStates.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
