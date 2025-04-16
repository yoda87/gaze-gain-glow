
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Check, X, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useUser } from '@/context/UserContext';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';

interface Advertisement {
  id: string;
  title: string;
  description: string | null;
  duration: number;
  points_reward: number;
}

const WatchAd = () => {
  const [adState, setAdState] = useState<'loading' | 'playing' | 'completed'>('loading');
  const [progress, setProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [currentAd, setCurrentAd] = useState<Advertisement | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { watchAd, user, getPointsPerAd } = useUser();
  
  // Extract adId from query params
  const searchParams = new URLSearchParams(location.search);
  const adId = searchParams.get('id');
  
  useEffect(() => {
    // Fetch specific ad if id is provided, otherwise fetch a random active ad
    const fetchAd = async () => {
      try {
        let query = supabase.from('advertisements').select('*').eq('is_active', true);
        
        if (adId) {
          query = query.eq('id', adId);
        } else {
          query = query.limit(1);
        }
        
        const { data, error } = await query;
        
        if (error) throw error;
        
        if (!data || data.length === 0) {
          toast.error("Aucune publicité disponible", {
            description: "Veuillez réessayer plus tard"
          });
          navigate('/');
          return;
        }
        
        setCurrentAd(data[0]);
        setTimeLeft(data[0].duration || 30); // Use ad duration or default to 30 seconds
        
        // Start the ad after loading
        const loadTimer = setTimeout(() => {
          setAdState('playing');
          
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
              const totalDuration = currentAd?.duration || 30;
              const newValue = prev + (100 / totalDuration);
              return Math.min(newValue, 100);
            });
          }, 1000);
          
          return () => clearInterval(interval);
        }, 2000);
        
        return () => clearTimeout(loadTimer);
      } catch (error) {
        console.error('Error fetching advertisement:', error);
        toast.error("Erreur lors du chargement", {
          description: "Impossible de charger la publicité"
        });
        navigate('/');
      }
    };
    
    fetchAd();
  }, [adId, navigate]);
  
  const handleCompleteAd = async () => {
    if (!currentAd) return;
    
    try {
      // Record the ad view in the database
      await supabase.from('ad_views').insert({
        ad_id: currentAd.id,
        user_id: user.id,
        completed: true,
        points_earned: getPointsPerAd()
      });
      
      await watchAd();
      
      toast.success("Bravo !", {
        description: `Vous avez gagné ${getPointsPerAd()} points en regardant cette publicité.`
      });
      
      if (user.adsWatchedToday === 1 && user.firstAdWatched && user.signupBonusAwarded) {
        toast.success("Bonus de bienvenue !", {
          description: "Vous avez reçu 100 points de bonus pour votre première publicité."
        });
      }
      
      navigate('/');
    } catch (error) {
      console.error('Error completing ad:', error);
      toast.error("Une erreur est survenue lors de la validation", {
        description: "Veuillez réessayer"
      });
    }
  };
  
  const handleSkip = () => {
    toast.error("Publicité ignorée", {
      description: "Vous n'avez pas gagné de points cette fois-ci."
    });
    navigate('/');
  };
  
  return (
    <Layout hideNav>
      <div className="h-screen flex flex-col">
        <div className="flex-1 bg-gray-900 flex items-center justify-center">
          {adState === 'loading' && (
            <div className="text-white flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-t-brand-purple rounded-full animate-spin mb-4"></div>
              <p>Chargement de la publicité...</p>
            </div>
          )}
          
          {adState === 'playing' && (
            <div className="w-full h-full flex items-center justify-center relative">
              <div className="text-white text-center">
                <h2 className="text-xl mb-2">{currentAd?.title || 'Publicité en cours'}</h2>
                <p className="opacity-70 mb-4">Regardez la vidéo pour gagner des points</p>
                
                <div className="bg-black/30 py-2 px-4 rounded-lg inline-flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5 text-brand-green" />
                  <span className="text-lg font-semibold">{getPointsPerAd()} points</span>
                </div>
              </div>
              
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
        
        <Progress value={progress} className="rounded-none h-2" />
        
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
