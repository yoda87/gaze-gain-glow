
import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';

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
    const isNative = Capacitor.isNativePlatform();
    
    // Detect platform
    const isAndroid = isNative && Capacitor.getPlatform() === 'android';
    const isIOS = isNative && Capacitor.getPlatform() === 'ios';
    
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
