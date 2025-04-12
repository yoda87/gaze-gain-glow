
import React from 'react';
import { Play } from 'lucide-react';

const SplashScreen = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-brand-purple to-brand-purple/80 p-4 font-['Outfit']">
      <div className="bg-white dark:bg-gray-900 rounded-full p-6 mb-6 shadow-lg animate-coin-drop">
        <Play size={64} className="text-brand-purple" />
      </div>
      
      <h1 className="text-4xl font-bold text-white mb-4 animate-slide-in">
        Gaze Gain Glow
      </h1>
      
      <p className="text-xl text-white/90 mb-8 animate-slide-in" style={{ animationDelay: '0.2s' }}>
        Regarde. Gagne. Kiffe.
      </p>
      
      <div className="w-16 h-1 bg-white/50 rounded-full overflow-hidden mt-8">
        <div className="h-full bg-white animate-pulse w-full"></div>
      </div>
    </div>
  );
};

export default SplashScreen;
