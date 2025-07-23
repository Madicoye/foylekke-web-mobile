import { useEffect, useState } from 'react';
import { NativeServices } from '../services/native';

export const usePlatform = () => {
  const [platformInfo, setPlatformInfo] = useState({
    isNative: false,
    isIOS: false,
    isAndroid: false,
    platform: 'web'
  });

  useEffect(() => {
    const info = NativeServices.getPlatformInfo();
    setPlatformInfo(info);
  }, []);

  return platformInfo;
};

export const useAppState = () => {
  const [isActive, setIsActive] = useState(true);
  const { isNative } = usePlatform();

  useEffect(() => {
    if (!isNative) return;

    NativeServices.App.addListeners({
      onResume: () => setIsActive(true),
      onPause: () => setIsActive(false)
    });
  }, [isNative]);

  return { isActive };
};

export const useDeepLinks = (callback: (url: string) => void) => {
  const { isNative } = usePlatform();

  useEffect(() => {
    if (!isNative) return;

    // Handle deep links when app is already running
    NativeServices.App.addListeners({
      onAppUrlOpen: (data) => {
        callback(data.url);
      }
    });

    // Handle deep links when app is launched from URL
    const checkLaunchUrl = async () => {
      const { url } = await NativeServices.App.getLaunchUrl() || {};
      if (url) {
        callback(url);
      }
    };

    checkLaunchUrl();
  }, [isNative, callback]);
};

export const useBackButton = (callback: () => void) => {
  const { isAndroid } = usePlatform();

  useEffect(() => {
    if (!isAndroid) return;

    NativeServices.App.addListeners({
      onBackButton: () => {
        callback();
      }
    });
  }, [isAndroid, callback]);
}; 