import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ 
  rating = 0, 
  maxRating = 5, 
  size = 16, 
  showValue = false, 
  interactive = false,
  onRatingChange,
  className = ''
}) => {
  const handleStarClick = (starIndex) => {
    if (interactive && onRatingChange) {
      onRatingChange(starIndex + 1);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 0; i < maxRating; i++) {
      const isFilled = i < Math.floor(rating);
      const isHalfFilled = !isFilled && i < rating;
      
      stars.push(
        <Star
          key={i}
          size={size}
          className={`${
            isFilled 
              ? 'fill-yellow-400 text-yellow-400' 
              : isHalfFilled 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
          } ${
            interactive ? 'cursor-pointer hover:text-yellow-400' : ''
          } transition-colors duration-200`}
          onClick={() => handleStarClick(i)}
        />
      );
    }
    return stars;
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`}>
      {renderStars()}
      {showValue && (
        <span className="text-sm text-gray-600 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default StarRating; 