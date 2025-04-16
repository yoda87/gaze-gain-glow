
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
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
  is_active: boolean;
}

const AvailableAds = () => {
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, getPointsPerAd } = useUser();
  
  useEffect(() => {
    fetchAvailableAds();
  }, []);
  
  const fetchAvailableAds = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .eq('is_active', true);
        
      if (error) throw error;
      
      setAdvertisements(data || []);
    } catch (error) {
      console.error('Error fetching advertisements:', error);
      toast.error("Erreur lors du chargement des publicités", {
        description: "Veuillez réessayer plus tard."
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleWatchAd = (adId: string) => {
    // Redirect to watch-ad page with the specific ad ID
    navigate(`/watch-ad?id=${adId}`);
  };
  
  return (
    <Layout>
      <div className="container max-w-md mx-auto pt-6 pb-20 px-4">
        <h1 className="text-2xl font-bold mb-6">Publicités disponibles</h1>
        
        {loading ? (
          // Loading skeletons
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-white dark:bg-gray-800">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : advertisements.length > 0 ? (
          // List of available advertisements
          <div className="space-y-4">
            {advertisements.map((ad) => (
              <Card key={ad.id} className="bg-white dark:bg-gray-800 hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{ad.title}</h3>
                  {ad.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{ad.description}</p>
                  )}
                  
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{ad.duration} secondes</span>
                    </div>
                    <div className="bg-brand-purple/10 text-brand-purple px-2 py-1 rounded-full flex items-center text-sm font-medium">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      <span>{getPointsPerAd()} pts</span>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => handleWatchAd(ad.id)} 
                    className="w-full bg-gradient-to-br from-brand-purple to-brand-purple/80 hover:from-brand-purple/90 hover:to-brand-purple/70"
                  >
                    <Play className="mr-2 h-4 w-4" /> Regarder la publicité
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          // No advertisements available
          <div className="text-center py-12">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-4 inline-flex mb-4">
              <AlertCircle className="h-8 w-8 text-gray-500 dark:text-gray-400" />
            </div>
            <h3 className="text-lg font-medium mb-2">Aucune publicité disponible</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Revenez plus tard pour voir les nouvelles publicités disponibles.
            </p>
            <Button 
              onClick={() => navigate('/')} 
              variant="outline"
              className="mx-auto"
            >
              Retour à l'accueil
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AvailableAds;
