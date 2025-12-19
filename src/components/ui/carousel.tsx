'use client';
import { IconArrowNarrowRight } from '@tabler/icons-react';
import { useState, useRef, useId, useEffect } from 'react';
import { User, Edit, Trash2, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

interface SlideData {
  title: string;
  button: string;
  src: string;
  // Add additional data needed for the card content
  age: string | number;
  sex: string;
  chronic_conditions?: string;
  medications?: string;
  allergies?: string;
  isAddNew?: boolean;
}

interface SlideProps {
  slide: SlideData;
  index: number;
  current: number;
  handleSlideClick: (index: number) => void;
  onEdit: () => void;
  onDelete: () => void;
  onStartDiagnosis: () => void;
  t: (key: string) => string;
}

const Slide = ({ slide, index, current, handleSlideClick, onEdit, onDelete, onStartDiagnosis, t }: SlideProps) => {
  const slideRef = useRef<HTMLLIElement>(null);

  const xRef = useRef(0);
  const yRef = useRef(0);
  const frameRef = useRef<number>();

  useEffect(() => {
    const animate = () => {
      if (!slideRef.current) return;

      const x = xRef.current;
      const y = yRef.current;

      slideRef.current.style.setProperty('--x', `${x}px`);
      slideRef.current.style.setProperty('--y', `${y}px`);

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const handleMouseMove = (event: React.MouseEvent) => {
    const el = slideRef.current;
    if (!el) return;

    const r = el.getBoundingClientRect();
    xRef.current = event.clientX - (r.left + Math.floor(r.width / 2));
    yRef.current = event.clientY - (r.top + Math.floor(r.height / 2));
  };

  const handleMouseLeave = () => {
    xRef.current = 0;
    yRef.current = 0;
  };

  const { src, button, title, age, sex, chronic_conditions, medications, allergies, isAddNew } = slide;

  return (
    <div className="[perspective:1200px] [transform-style:preserve-3d]">
      <li
        ref={slideRef}
        className="flex flex-1 flex-col items-center justify-center relative text-center text-white opacity-100 transition-all duration-300 ease-in-out w-[80vw] h-[120vw] sm:w-[50vw] sm:h-[70vw] md:w-[45vw] md:h-[60vw] max-w-[500px] max-h-[680px] mx-[4vmin] z-10"
        onClick={() => handleSlideClick(index)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: current !== index ? 'scale(0.98) rotateX(8deg)' : 'scale(1) rotateX(0deg)',
          transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
          transformOrigin: 'bottom',
        }}
      >
        <div
          className={cn(
            'absolute top-0 left-0 w-full h-full rounded-2xl overflow-hidden transition-all duration-150 ease-out border border-white/10 shadow-2xl',
            isAddNew
              ? 'bg-[#1D1F2F] flex items-center justify-center cursor-pointer hover:bg-[#25283d]'
              : 'bg-[#1D1F2F]'
          )}
          style={{
            transform: current === index ? 'translate3d(calc(var(--x) / 30), calc(var(--y) / 30), 0)' : 'none',
          }}
        >
          {isAddNew ? (
            <div className="flex flex-col items-center justify-center gap-4 p-8 text-center" onClick={onStartDiagnosis}>
              <div className="rounded-full bg-primary/10 p-6">
                <PlusCircle className="h-16 w-16 text-blue-500" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-200">{title}</h3>
                <p className="text-gray-500 mt-2">{button}</p>
              </div>
            </div>
          ) : (
            <>
              {/* Background Image / Placeholder */}
              <div className="absolute inset-0 w-full h-full object-cover opacity-40 transition-opacity duration-600 ease-in-out flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-black">
                {src && src !== '/images/default-profile-bg.jpg' ? (
                  <img src={src} alt={title} className="w-full h-full object-cover blur-sm scale-110" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-slate-800 to-slate-950"></div>
                )}
              </div>

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

              {/* Content Container */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 z-20">
                {/* Profile Avatar */}
                <div className="relative mb-2 group">
                  <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-white/20 shadow-xl">
                    <AvatarImage src={src} className="object-cover" />
                    <AvatarFallback className="bg-white/10 text-white text-3xl">
                      <User className="h-12 w-12" />
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Basic Info */}
                <h2 className="text-2xl md:text-4xl font-bold mb-1 text-white drop-shadow-md text-center line-clamp-1">
                  {title}
                </h2>
                <p className="text-lg text-white/80 mb-4 font-medium">
                  {age} {t('age')} • {t(sex)}
                </p>

                {/* Medical Summary (Brief) */}
                <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-xl p-4 mb-4 text-sm text-left border border-white/5 space-y-2">
                  <div className="truncate">
                    <span className="font-semibold text-indigo-300">{t('conditions')}:</span>{' '}
                    <span className="text-white/90">{chronic_conditions || t('none')}</span>
                  </div>
                  <div className="truncate">
                    <span className="font-semibold text-indigo-300">{t('medications')}:</span>{' '}
                    <span className="text-white/90">{medications || t('none')}</span>
                  </div>
                  <div className="truncate">
                    <span className="font-semibold text-indigo-300">{t('allergies')}:</span>{' '}
                    <span className="text-white/90">{allergies || t('none')}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div
                  className={cn(
                    'flex flex-col gap-3 w-full max-w-xs transition-opacity duration-500',
                    current === index ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                  )}
                >
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartDiagnosis();
                    }}
                    className="w-full bg-white text-black hover:bg-white/90 font-semibold h-12 rounded-xl text-md shadow-lg"
                  >
                    {button}
                  </Button>

                  <div className="flex gap-2 justify-center mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                      }}
                      className="text-white/70 hover:text-white hover:bg-white/10"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      {t('edit')}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                      }}
                      className="text-white/70 hover:text-red-400 hover:bg-white/10"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      {t('delete')}
                    </Button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </li>
    </div>
  );
};

interface CarouselControlProps {
  type: string;
  title: string;
  handleClick: () => void;
}

const CarouselControl = ({ type, title, handleClick }: CarouselControlProps) => {
  return (
    <button
      className={`w-10 h-10 flex items-center mx-2 justify-center bg-neutral-200 dark:bg-neutral-800 border-3 border-transparent rounded-full focus:border-[#6D64F7] focus:outline-none hover:-translate-y-0.5 active:translate-y-0.5 transition duration-200 ${
        type === 'previous' ? 'rotate-180' : ''
      }`}
      title={title}
      onClick={handleClick}
    >
      <IconArrowNarrowRight className="text-neutral-600 dark:text-neutral-200" />
    </button>
  );
};

interface CarouselProps {
  slides: SlideData[];
  onSlideClick?: (index: number) => void;
  onEditProfile: (index: number) => void;
  onDeleteProfile: (index: number) => void;
  onStartDiagnosis: (index: number) => void;
  onAddNewProfile: () => void;
  t: (key: string) => string;
}

export default function Carousel({
  slides,
  onSlideClick,
  onEditProfile,
  onDeleteProfile,
  onStartDiagnosis,
  onAddNewProfile,
  t,
}: CarouselProps) {
  const [current, setCurrent] = useState(0);

  const handlePreviousClick = () => {
    const previous = current - 1;
    setCurrent(previous < 0 ? slides.length - 1 : previous);
  };

  const handleNextClick = () => {
    const next = current + 1;
    setCurrent(next === slides.length ? 0 : next);
  };

  const handleSlideClick = (index: number) => {
    if (current !== index) {
      setCurrent(index);
    } else if (onSlideClick) {
      onSlideClick(index);
    }
  };

  const id = useId();

  return (
    <div
      className="relative w-[80vw] h-[120vw] sm:w-[50vw] sm:h-[70vw] md:w-[45vw] md:h-[60vw] max-w-[500px] max-h-[680px] mx-auto"
      aria-labelledby={`carousel-heading-${id}`}
    >
      <ul
        className="absolute flex mx-[-4vmin] transition-transform duration-1000 ease-in-out"
        style={{
          transform: `translateX(-${current * (100 / slides.length)}%)`,
        }}
      >
        {slides.map((slide, index) => (
          <Slide
            key={index}
            slide={slide}
            index={index}
            current={current}
            handleSlideClick={handleSlideClick}
            onEdit={() => onEditProfile(index)}
            onDelete={() => onDeleteProfile(index)}
            onStartDiagnosis={() => {
              if (slide.isAddNew) {
                onAddNewProfile();
              } else {
                onStartDiagnosis(index);
              }
            }}
            t={t}
          />
        ))}
      </ul>

      <div className="absolute flex justify-center w-full top-[calc(100%+1rem)]">
        <CarouselControl type="previous" title="Go to previous slide" handleClick={handlePreviousClick} />

        <CarouselControl type="next" title="Go to next slide" handleClick={handleNextClick} />
      </div>
    </div>
  );
}
