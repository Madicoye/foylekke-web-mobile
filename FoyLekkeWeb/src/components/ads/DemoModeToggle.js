import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Sparkles } from 'lucide-react';
import { isDemoMode, toggleDemoMode } from '../../services/demoAds';

const DemoModeToggle = ({ className = '' }) => {
  const [isDemo, setIsDemo] = useState(false);

  useEffect(() => {
    setIsDemo(isDemoMode());
  }, []);

  const handleToggle = () => {
    const newMode = toggleDemoMode();
    setIsDemo(newMode);
    
    // Refresh the page to apply the new mode
    window.location.reload();
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button
        onClick={handleToggle}
        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
          isDemo
            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        {isDemo ? (
          <>
            <Sparkles size={16} />
            <span>Demo Ads ON</span>
          </>
        ) : (
          <>
            <Eye size={16} />
            <span>Demo Ads OFF</span>
          </>
        )}
      </button>
      
      {isDemo && (
        <div className="text-xs text-blue-600">
          Showing sample ads
        </div>
      )}
    </div>
  );
};

export default DemoModeToggle; 