import React, { useEffect, useRef } from 'react';

const GoogleAdsense = ({ 
  adClient, 
  adSlot, 
  adFormat = 'auto',
  adLayout = '',
  adLayoutKey = '',
  style = {},
  className = '',
  responsive = true
}) => {
  const adRef = useRef(null);
  const isLoaded = useRef(false);

  useEffect(() => {
    // Load Google AdSense script if not already loaded
    if (!window.adsbygoogle && !document.querySelector('script[src*="adsbygoogle.js"]')) {
      const script = document.createElement('script');
      script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      script.async = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);
    }

    // Initialize ad when script is loaded
    const initAd = () => {
      if (window.adsbygoogle && adRef.current && !isLoaded.current) {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          isLoaded.current = true;
        } catch (error) {
          console.error('Google AdSense error:', error);
        }
      }
    };

    // Check if script is already loaded
    if (window.adsbygoogle) {
      initAd();
    } else {
      // Wait for script to load
      const checkScript = setInterval(() => {
        if (window.adsbygoogle) {
          initAd();
          clearInterval(checkScript);
        }
      }, 100);

      // Cleanup interval after 10 seconds
      setTimeout(() => clearInterval(checkScript), 10000);
    }
  }, []);

  const defaultStyle = {
    display: 'block',
    width: '100%',
    height: 'auto',
    ...style
  };

  return (
    <div className={`google-adsense-container ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={defaultStyle}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-ad-layout={adLayout}
        data-ad-layout-key={adLayoutKey}
        data-full-width-responsive={responsive}
      />
    </div>
  );
};

export default GoogleAdsense; 