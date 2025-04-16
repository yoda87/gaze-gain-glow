
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, TrendingUp, Calendar, Play, Gift } from 'lucide-react';
import Layout from '@/components/Layout';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useUser } from '@/context/UserContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Dashboard = () => {
  const { user, loadUserProfile, awardSignupBonus, canLevelUp, levelUp, getPointsPerAd } = useUser();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Vérifier si le bonus d'inscription doit être attribué
    if (!user.signupBonusAwarded) {
      awardSignupBonus();
    }
    
    // Vérifier si l'utilisateur peut monter de niveau
    if (canLevelUp()) {
      levelUp();
    }
  }, [user.signupBonusAwarded, user.totalPointsEarned]);
  
  // Function to get time of day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  };
  
  // Vérifier s'il y a des publicités disponibles
  const checkAdsAvailability = async () => {
    try {
      const { data, error } = await supabase
        .from('advertisements')
        .select('id')
        .eq('is_active', true)
        .limit(1);
        
      if (error) throw error;
      
      if (!data || data.length === 0) {
        toast.error("Aucune publicité disponible pour le moment");
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error checking ads availability:', error);
      return false;
    }
  };
  
  const handleWatchAd = async () => {
    const adsAvailable = await checkAdsAvailability();
    if (adsAvailable) {
      navigate('/watch-ad');
    }
  };
  
  // Calculer le taux de conversion
  const conversionRate = () => {
    // 1000 points = 0,10€
    return `${(user.balance / 1000 * 0.1).toFixed(2)}€`;
  };
  
  return (
    <Layout>
      <div className="container max-w-md mx-auto pt-6 pb-20 px-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">
            {getGreeting()}, <span className="text-brand-purple">{user.name}</span> !
          </h1>
          <div className="flex items-center gap-1 bg-brand-purple/10 px-3 py-1 rounded-full">
            <Award className="text-brand-purple h-4 w-4" />
            <span className="text-sm font-medium">Niveau {user.level}</span>
          </div>
        </div>
        
        <Card className="mb-6 bg-gradient-to-br from-brand-purple to-brand-purple/80 text-white border-none">
          <CardContent className="pt-6">
            <p className="text-sm text-white/80 mb-1">Solde actuel</p>
            <h2 className="text-3xl font-bold mb-1">{user.balance} points</h2>
            <p className="text-sm text-white/80 mb-3">Équivalent à environ {conversionRate()}</p>
            
            {user.level < 3 && (
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Niveau {user.level} → {user.level + 1}</span>
                  <span>{user.nextLevelProgress} / {user.nextLevelTarget}</span>
                </div>
                <Progress 
                  value={user.nextLevelProgress / user.nextLevelTarget * 100} 
                  className="h-2 bg-white/20" 
                />
              </div>
            )}
            
            {user.level === 3 && (
              <div className="bg-white/20 text-sm text-center py-2 px-4 rounded-md mb-4">
                Niveau maximum atteint ! (Niveau 3)
              </div>
            )}
          </CardContent>
        </Card>
        
        <Button 
          onClick={handleWatchAd}
          size="lg"
          className="w-full py-8 text-lg mb-6 bg-gradient-to-br from-brand-purple to-brand-purple/80 hover:from-brand-purple/90 hover:to-brand-purple/70 animate-pulse-scale border-none"
        >
          <Play className="mr-2 h-6 w-6" /> Regarder une pub (+{getPointsPerAd()}pts)
        </Button>
        
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard 
            icon={<Calendar className="h-5 w-5 text-brand-purple" />}
            label="Pubs aujourd'hui"
            value={user.adsWatchedToday}
          />
          <StatCard 
            icon={<TrendingUp className="h-5 w-5 text-brand-green" />}
            label="Gains du jour"
            value={`${user.dailyEarnings} pts`}
          />
          <StatCard 
            icon={<Gift className="h-5 w-5 text-brand-gold" />}
            label="Parrainage"
            value={`${user.referrals} filleuls`}
          />
        </div>
        
        <div className="p-4 bg-brand-purple/10 rounded-lg border border-brand-purple/20">
          <h3 className="font-semibold mb-2 flex items-center">
            <Award className="h-4 w-4 mr-1 text-brand-purple" /> 
            Mission du jour
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
            Regardez 5 publicités aujourd'hui pour gagner un bonus de 200 points !
          </p>
          <Progress value={user.adsWatchedToday / 5 * 100} className="h-2" />
          <p className="text-xs text-right mt-1 text-gray-600 dark:text-gray-400">
            {user.adsWatchedToday}/5 complétées
          </p>
        </div>
        
        {/* Niveaux et points info */}
        <Card className="mt-6">
          <CardContent className="pt-6">
            <h3 className="font-semibold mb-2 flex items-center">
              <Award className="h-4 w-4 mr-1 text-brand-purple" /> 
              Système de niveaux
            </h3>
            <div className="space-y-2 mt-4">
              <div className="flex justify-between items-center py-1">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${user.level >= 1 ? "bg-brand-purple text-white" : "bg-gray-200"}`}>1</div>
                  <span className="ml-2">Débutant</span>
                </div>
                <div className="text-sm font-medium">10 pts/pub</div>
              </div>
              
              <div className="flex justify-between items-center py-1">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${user.level >= 2 ? "bg-brand-purple text-white" : "bg-gray-200"}`}>2</div>
                  <span className="ml-2">Intermédiaire</span>
                </div>
                <div className="text-sm font-medium">13 pts/pub</div>
              </div>
              
              <div className="flex justify-between items-center py-1">
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${user.level >= 3 ? "bg-brand-purple text-white" : "bg-gray-200"}`}>3</div>
                  <span className="ml-2">Avancé</span>
                </div>
                <div className="text-sm font-medium">15 pts/pub</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}

const StatCard = ({ icon, label, value }: StatCardProps) => {
  return (
    <Card className="bg-white dark:bg-gray-800">
      <CardContent className="p-3 flex flex-col items-center justify-center">
        <div className="mb-1">{icon}</div>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{label}</p>
        <p className="font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
};

export default Dashboard;
