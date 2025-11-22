import { useState } from 'react';
import { Maximize2, Minimize2, RotateCw, ZoomIn, ZoomOut, X, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Car360ViewerProps {
  images: string[];
  carName: string;
}

export default function Car360Viewer({ images, carName }: Car360ViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [showInfo, setShowInfo] = useState(true);

  // Auto-hide info after 3 seconds
  useState(() => {
    const timer = setTimeout(() => setShowInfo(false), 3000);
    return () => clearTimeout(timer);
  });

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
    setShowInfo(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - startX;
    const sensitivity = 5; // Adjust for rotation speed

    if (Math.abs(deltaX) > sensitivity) {
      if (deltaX > 0) {
        // Rotate right
        setCurrentIndex((prev) => (prev + 1) % images.length);
      } else {
        // Rotate left
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
      }
      setStartX(e.clientX);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setShowInfo(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const deltaX = e.touches[0].clientX - startX;
    const sensitivity = 5;

    if (Math.abs(deltaX) > sensitivity) {
      if (deltaX > 0) {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      } else {
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
      }
      setStartX(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const autoRotate = () => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 100);

    setTimeout(() => clearInterval(interval), 2000);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.2, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.2, 1));
  };

  const ViewerContent = () => (
    <div className="relative w-full h-full bg-gray-900 rounded-xl overflow-hidden">
      {/* Image Display */}
      <div
        className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={images[currentIndex]}
          alt={`${carName} - View ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain transition-transform duration-200"
          style={{ transform: `scale(${zoom})` }}
          draggable={false}
        />
      </div>

      {/* Info Overlay */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/70 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm flex items-center gap-2"
          >
            <Info className="w-4 h-4" />
            <span>Drag to rotate • Scroll to zoom</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Controls */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black/70 backdrop-blur-sm rounded-full px-4 py-2">
        <button
          onClick={handleZoomOut}
          className="p-2 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-5 h-5 text-white" />
        </button>
        
        <button
          onClick={autoRotate}
          className="p-2 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Auto rotate"
        >
          <RotateCw className="w-5 h-5 text-white" />
        </button>
        
        <button
          onClick={handleZoomIn}
          className="p-2 hover:bg-white/20 rounded-full transition-colors"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-5 h-5 text-white" />
        </button>

        {!isFullscreen && (
          <button
            onClick={() => setIsFullscreen(true)}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Fullscreen"
          >
            <Maximize2 className="w-5 h-5 text-white" />
          </button>
        )}
      </div>

      {/* Progress Indicator */}
      <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Rotation Indicator */}
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2">
        <div className="flex gap-1">
          {images.map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-8 bg-ekami-gold-500'
                  : 'w-1 bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Regular View */}
      <div className="w-full h-[500px] md:h-[600px]">
        <ViewerContent />
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black"
          >
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              aria-label="Exit fullscreen"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            
            <div className="w-full h-full">
              <ViewerContent />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
