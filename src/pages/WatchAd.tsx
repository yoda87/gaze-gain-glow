
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check, X, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useUser } from '@/context/UserContext';
import Layout from '@/components/Layout';

const WatchAd = () => {
  const [adState, setAdState] = useState<'loading' | 'playing' | 'completed'>('loading');
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const navigate = useNavigate();
  const { watchAd, user, getPointsPerAd } = useUser();
  
  useEffect(() => {
    // Simulate loading
    const loadTimer = setTimeout(() => {
      setAdState('playing');
      
      // Start countdown and progress for ad view
      const interval = setInterval(() => {
        setTimeLeft(prev => {
          const newValue = prev - 1;
          if (newValue <= 0) {
            clearInterval(interval);
            setAdState('completed');
            return 0;
          }
          return newValue;
        });
        
        setProgress(prev => {
          const newValue = prev + (100 / 30);
          return Math.min(newValue, 100);
        });
      }, 1000);
      
      return () => clearInterval(interval);
    }, 2000);
    
    return () => clearTimeout(loadTimer);
  }, []);
  
  const handleCompleteAd = async () => {
    try {
      await watchAd();
      
      toast.success("Bravo !", {
        description: `Vous avez gagné ${getPointsPerAd()} points en regardant cette publicité.`,
      });
      
      // Si c'était la première pub et que le bonus a été attribué
      if (user.adsWatchedToday === 1 && user.firstAdWatched && user.signupBonusAwarded) {
        toast.success("Bonus de bienvenue !", {
          description: "Vous avez reçu 100 points de bonus pour votre première publicité.",
        });
      }
      
      navigate('/');
    } catch (error) {
      console.error('Error completing ad:', error);
      toast.error("Une erreur est survenue lors de la validation");
    }
  };
  
  const handleSkip = () => {
    toast({
      title: "Publicité ignorée",
      description: "Vous n'avez pas gagné de points cette fois-ci.",
      variant: "destructive",
    });
    navigate('/');
  };
  
  return (
    <Layout hideNav>
      <div className="h-screen flex flex-col">
        {/* Ad viewing area */}
        <div className="flex-1 bg-gray-900 flex items-center justify-center">
          {adState === 'loading' && (
            <div className="text-white flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-t-brand-purple rounded-full animate-spin mb-4"></div>
              <p>Chargement de la publicité...</p>
            </div>
          )}
          
          {adState === 'playing' && (
            <div className="w-full h-full flex items-center justify-center relative">
              {/* Placeholder for actual ad video */}
              <div className="text-white text-center">
                <h2 className="text-xl mb-2">Publicité en cours</h2>
                <p className="opacity-70 mb-4">Regardez la vidéo pour gagner des points</p>
                
                {/* Afficher les points à gagner selon le niveau */}
                <div className="bg-black/30 py-2 px-4 rounded-lg inline-flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-brand-green" />
                  <span className="text-lg font-semibold">{getPointsPerAd()} points</span>
                </div>
              </div>
              
              {/* Timer overlay */}
              <div className="absolute top-4 right-4 bg-black/50 text-white py-1 px-3 rounded-full text-sm">
                {timeLeft}s
              </div>
            </div>
          )}
          
          {adState === 'completed' && (
            <div className="text-white text-center">
              <h2 className="text-xl mb-3">Vidéo terminée !</h2>
              <p className="opacity-70 mb-4">Cliquez sur Valider pour recevoir vos points</p>
              <div className="mb-6 font-semibold text-2xl flex justify-center items-center">
                <TrendingUp className="mr-2 h-6 w-6 text-brand-green" />
                <span>+{getPointsPerAd()} points</span>
              </div>
              <Button onClick={handleCompleteAd} className="bg-gradient-to-br from-brand-green to-brand-green/80 hover:from-brand-green/90 hover:to-brand-green/70">
                <Check className="mr-2 h-5 w-5" />
                Valider et gagner
              </Button>
            </div>
          )}
        </div>
        
        {/* Progress bar */}
        <Progress value={progress} className="rounded-none h-2" />
        
        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 p-4 flex justify-between">
          <Button 
            variant="outline" 
            onClick={handleSkip}
            className="text-red-500 border-red-200"
          >
            <X className="mr-2 h-4 w-4" />
            Ignorer
          </Button>
          
          {adState === 'completed' && (
            <Button onClick={handleCompleteAd} className="bg-gradient-to-br from-brand-green to-brand-green/80">
              <Check className="mr-2 h-4 w-4" />
              Valider
            </Button>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default WatchAd;
