
import { useEffect, useState } from 'react';

interface DeviceInfo {
  isNative: boolean;
  isAndroid: boolean;
  isIOS: boolean;
  hasHaptics: boolean;
}

export function useDevice(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isNative: false,
    isAndroid: false,
    isIOS: false,
    hasHaptics: false
  });

  useEffect(() => {
    // Check if the app is running in a Capacitor native environment
    const isNative = window.Capacitor?.isNativePlatform() || false;
    
    // Detect platform
    const isAndroid = isNative && window.Capacitor?.getPlatform() === 'android';
    const isIOS = isNative && window.Capacitor?.getPlatform() === 'ios';
    
    // Feature detection
    const hasHaptics = 'navigator' in window && 'vibrate' in navigator;

    setDeviceInfo({
      isNative,
      isAndroid,
      isIOS,
      hasHaptics
    });
  }, []);

  return deviceInfo;
}
