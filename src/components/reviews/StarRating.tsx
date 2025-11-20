import { useState } from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
  count?: number;
}

export default function StarRating({ 
  rating, 
  onRatingChange, 
  readonly = false,
  size = 'md',
  showCount = false,
  count = 0
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const handleClick = (value: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value: number) => {
    if (!readonly) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((value) => {
          const isFilled = value <= displayRating;
          const isPartial = !Number.isInteger(displayRating) && 
                           value === Math.ceil(displayRating) && 
                           value > Math.floor(displayRating);
          
          return (
            <motion.button
              key={value}
              type="button"
              onClick={() => handleClick(value)}
              onMouseEnter={() => handleMouseEnter(value)}
              onMouseLeave={handleMouseLeave}
              disabled={readonly}
              whileHover={!readonly ? { scale: 1.1 } : {}}
              whileTap={!readonly ? { scale: 0.95 } : {}}
              className={`relative transition-colors ${
                readonly ? 'cursor-default' : 'cursor-pointer'
              }`}
              aria-label={`Rate ${value} stars`}
            >
              {isPartial ? (
                <div className="relative">
                  {/* Background star (empty) */}
                  <Star 
                    className={`${sizeClasses[size]} text-ekami-silver-300 dark:text-ekami-charcoal-600`}
                  />
                  {/* Foreground star (partial fill) */}
                  <div 
                    className="absolute inset-0 overflow-hidden"
                    style={{ width: `${(displayRating % 1) * 100}%` }}
                  >
                    <Star 
                      className={`${sizeClasses[size]} text-ekami-gold-500 fill-ekami-gold-500`}
                    />
                  </div>
                </div>
              ) : (
                <Star
                  className={`${sizeClasses[size]} transition-colors ${
                    isFilled
                      ? 'text-ekami-gold-500 fill-ekami-gold-500'
                      : 'text-ekami-silver-300 dark:text-ekami-charcoal-600'
                  } ${
                    !readonly && hoverRating >= value
                      ? 'text-ekami-gold-400 fill-ekami-gold-400'
                      : ''
                  }`}
                />
              )}
            </motion.button>
          );
        })}
      </div>
      
      {showCount && count > 0 && (
        <span className="text-sm text-ekami-charcoal-600 dark:text-ekami-silver-400 ml-1">
          ({count})
        </span>
      )}
      
      {!readonly && hoverRating > 0 && (
        <span className="text-sm font-medium text-ekami-gold-600 ml-2">
          {hoverRating} {hoverRating === 1 ? 'star' : 'stars'}
        </span>
      )}
    </div>
  );
}
