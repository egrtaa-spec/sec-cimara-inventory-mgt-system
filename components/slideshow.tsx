'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
// Ensure this import path matches your project structure
import { AdminLoginModal } from '@/components/admin-login-modal'; 

const slides = [
  {
    id: 1,
    title: 'Structural Excellence',
    description: 'Professional construction and foundation management',
    image: '/equipment.jpeg',
  },
  {
    id: 2,
    title: 'Team Coordination',
    description: 'Coordinated workforce for efficient project delivery',
    image: '/inventory.jpeg',
  },
  {
    id: 3,
    title: 'Quality Control',
    description: 'Precision engineering and site management',
    image: '/quality.jpeg',
  },
];

interface SlideshowProps {
  onLoginClick: () => void;
}

export function Slideshow({ onLoginClick }: SlideshowProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  // Replaced the broken function with actual React state
  const [adminOpen, setAdminOpen] = useState(false); 

  useEffect(() => {
    if (!isAutoPlay) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlay]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlay(false);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlay(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlay(false);
  };

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Slides */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={slide.image || "/placeholder.svg"}
              alt={slide.title}
              fill
              className="object-cover"
              priority={index === 0}
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/40" />
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center gap-6 px-6">
        <h1 className="text-5xl md:text-6xl font-bold text-balance">
          {slides[currentSlide].title}
        </h1>
        <p className="text-xl md:text-2xl text-white/80 max-w-2xl">
          {slides[currentSlide].description}
        </p>
        
        <div className="flex flex-col gap-4 items-center">
          <Button
            onClick={onLoginClick}
            size="lg"
            className="mt-4 px-8 bg-primary hover:bg-primary/90"
          >
            Login to Access Dashboard
          </Button>

          {/* Admin Button and Modal */}
          <Button
            variant="outline"
            size="sm"
            className="bg-transparent border-white text-white hover:bg-white/20"
            onClick={() => setAdminOpen(true)}
          >
            Admin Panel
          </Button>
          
          <AdminLoginModal 
            open={adminOpen} 
            onOpenChange={setAdminOpen} 
          />
        </div>
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className="absolute left-6 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={nextSlide}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Slide Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide
                ? 'bg-white w-8'
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Auto-play Resume Hint */}
      <div className="absolute top-6 right-6 text-white/60 text-sm">
        {!isAutoPlay && (
          <button
            onClick={() => setIsAutoPlay(true)}
            className="hover:text-white transition-colors"
          >
            Resume Autoplay
          </button>
        )}
      </div>
    </div>
  );
}