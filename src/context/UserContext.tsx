
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface User {
  id: string; // Ajout de la propriété 'id' manquante
  name: string;
  balance: number;
  adsWatchedToday: number;
  dailyEarnings: number;
  activeBonus: string | null;
  level: number;
  nextLevelProgress: number;
  nextLevelTarget: number;
  referrals: number;
  referralEarnings: number;
  referralCode: string;
  totalPointsEarned: number;
  signupBonusAwarded: boolean;
  firstAdWatched: boolean;
}

interface UserContextType {
  user: User;
  updateBalance: (amount: number) => void;
  watchAd: () => Promise<void>;
  updateReferrals: (count: number, earnings: number) => void;
  loadUserProfile: () => Promise<void>;
  awardSignupBonus: () => Promise<void>;
  getPointsPerAd: () => number;
  canLevelUp: () => boolean;
  levelUp: () => Promise<void>;
}

// Points par niveau selon les spécifications
const POINTS_PER_LEVEL = {
  1: 10,  // Niveau 1: 10 points par pub
  2: 13,  // Niveau 2: 13 points par pub
  3: 15,  // Niveau 3: 15 points par pub
};

// Seuils pour passer au niveau suivant
const LEVEL_THRESHOLDS = {
  1: 500,   // 500 points pour passer au niveau 2
  2: 2000,  // 2000 points pour passer au niveau 3
};

// Bonus d'inscription
const SIGNUP_BONUS = 100;

// Initial state with zero balance for new users
const initialUser: User = {
  name: '',
  balance: 0,
  adsWatchedToday: 0,
  dailyEarnings: 0,
  activeBonus: null,
  level: 1,
  nextLevelProgress: 0,
  nextLevelTarget: LEVEL_THRESHOLDS[1],
  referrals: 0,
  referralEarnings: 0,
  referralCode: '',
  totalPointsEarned: 0,
  signupBonusAwarded: false,
  firstAdWatched: false
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(initialUser);
  const [adsWatchedToday, setAdsWatchedToday] = useState<number>(0);
  const { user: authUser, isAuthenticated } = useAuth();

  const loadUserProfile = async () => {
    if (authUser && isAuthenticated) {
      try {
        // Try to fetch user profile from Supabase
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authUser.id)
          .single();
          
        if (error) {
          console.error('Error fetching user profile:', error);
          return;
        }

        // Récupérer le nombre de pubs vues aujourd'hui
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const { data: adViewsToday, error: adViewsError } = await supabase
          .from('ad_views')
          .select('*')
          .eq('user_id', authUser.id)
          .gte('viewed_at', today.toISOString())
          .eq('completed', true);
          
        if (adViewsError) {
          console.error('Error fetching today ad views:', adViewsError);
        }
        
        // Calculer les gains du jour
        const todayEarnings = adViewsToday?.reduce((sum, view) => sum + (view.points_earned || 0), 0) || 0;
        
        // Récupérer les parrainages
        const { data: referralsData, error: referralsError } = await supabase
          .from('referrals')
          .select('*')
          .eq('referrer_id', authUser.id)
          .eq('points_awarded', true);
          
        if (referralsError) {
          console.error('Error fetching referrals:', referralsError);
        }
        
        // Calculer le progrès pour le niveau suivant
        let nextLevelTarget = LEVEL_THRESHOLDS[data.level as keyof typeof LEVEL_THRESHOLDS] || 0;
        let nextLevelProgress = data.level >= 3 ? nextLevelTarget : data.total_points_earned || 0;
        
        if (data.level === 2) {
          nextLevelProgress = data.total_points_earned - LEVEL_THRESHOLDS[1];
        } else if (data.level === 3) {
          nextLevelProgress = nextLevelTarget; // Au max si niveau 3
        }
        
        // Update user state with data from Supabase
        setUser(prev => ({
          ...prev,
          id: authUser.id, // Ajout de l'ID de l'utilisateur
          name: authUser.user_metadata.name || data?.name || 'Utilisateur',
          balance: data?.balance || 0,
          level: data?.level || 1,
          adsWatchedToday: adViewsToday?.length || 0,
          dailyEarnings: todayEarnings,
          nextLevelProgress,
          nextLevelTarget,
          referrals: referralsData?.length || 0,
          referralEarnings: referralsData?.length * 50 || 0, // 50 points par parrainage
          referralCode: data?.referral_code || '',
          totalPointsEarned: data?.total_points_earned || 0,
          signupBonusAwarded: data?.signup_bonus_awarded || false,
          firstAdWatched: data?.first_ad_watched || false
        }));
        
        setAdsWatchedToday(adViewsToday?.length || 0);
      } catch (error) {
        console.error('Failed to load user profile:', error);
      }
    }
  };

  // Load user profile when authenticated
  useEffect(() => {
    if (authUser && isAuthenticated) {
      loadUserProfile();
    }
  }, [authUser, isAuthenticated]);

  // Renvoie le nombre de points par pub selon le niveau
  const getPointsPerAd = () => {
    return POINTS_PER_LEVEL[user.level as keyof typeof POINTS_PER_LEVEL] || POINTS_PER_LEVEL[1];
  };

  // Vérifie si l'utilisateur peut passer au niveau suivant
  const canLevelUp = () => {
    if (user.level >= 3) return false; // Niveau max atteint
    
    const threshold = LEVEL_THRESHOLDS[user.level as keyof typeof LEVEL_THRESHOLDS];
    return user.totalPointsEarned >= threshold;
  };

  // Passe au niveau suivant
  const levelUp = async () => {
    if (!canLevelUp()) return;
    
    try {
      const newLevel = user.level + 1;
      
      // Mise à jour en base de données
      const { error } = await supabase
        .from('profiles')
        .update({ level: newLevel })
        .eq('id', authUser?.id);
        
      if (error) throw error;
      
      // Mise à jour locale
      setUser(prev => {
        const nextThreshold = LEVEL_THRESHOLDS[newLevel as keyof typeof LEVEL_THRESHOLDS] || 0;
        let nextProgress = 0;
        
        if (newLevel === 2) {
          nextProgress = prev.totalPointsEarned - LEVEL_THRESHOLDS[1];
        }
        
        return {
          ...prev,
          level: newLevel,
          nextLevelProgress: nextProgress,
          nextLevelTarget: nextThreshold
        };
      });
      
      toast.success(`Niveau ${newLevel} débloqué !`, {
        description: `Vous gagnez maintenant ${POINTS_PER_LEVEL[newLevel as keyof typeof POINTS_PER_LEVEL]} points par pub.`
      });
      
    } catch (error) {
      console.error('Error leveling up:', error);
      toast.error("Erreur lors du passage au niveau supérieur");
    }
  };

  const updateBalance = async (amount: number) => {
    if (!authUser) return;
    
    try {
      // Mise à jour en base de données
      const { error } = await supabase
        .from('profiles')
        .update({ 
          balance: user.balance + amount,
          total_points_earned: user.totalPointsEarned + (amount > 0 ? amount : 0)
        })
        .eq('id', authUser.id);
        
      if (error) throw error;
      
      // Mise à jour locale
      setUser(prev => {
        const newTotalPoints = prev.totalPointsEarned + (amount > 0 ? amount : 0);
        let nextLevelProgress = prev.nextLevelProgress;
        
        if (prev.level === 1) {
          nextLevelProgress = Math.min(newTotalPoints, LEVEL_THRESHOLDS[1]);
        } else if (prev.level === 2) {
          nextLevelProgress = Math.min(newTotalPoints - LEVEL_THRESHOLDS[1], LEVEL_THRESHOLDS[2] - LEVEL_THRESHOLDS[1]);
        }
        
        return {
          ...prev,
          balance: prev.balance + amount,
          dailyEarnings: prev.dailyEarnings + (amount > 0 ? amount : 0),
          totalPointsEarned: newTotalPoints,
          nextLevelProgress
        };
      });
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  };

  const watchAd = async () => {
    if (!authUser) return;
    
    try {
      // Vérifier si des pubs sont disponibles
      const { data: ads, error: adsError } = await supabase
        .from('advertisements')
        .select('id, points_reward')
        .eq('is_active', true)
        .limit(1);
        
      if (adsError) throw adsError;
      
      if (!ads || ads.length === 0) {
        toast.error("Aucune publicité disponible pour le moment");
        return;
      }
      
      // Points gagnés selon le niveau
      const pointsEarned = getPointsPerAd();
      const adId = ads[0].id;
      
      // Enregistrer la vue de publicité
      const { error } = await supabase
        .from('ad_views')
        .insert({
          user_id: authUser.id,
          ad_id: adId,
          completed: true,
          points_earned: pointsEarned
        });
        
      if (error) throw error;
      
      // Vérifier si c'est la première pub regardée (pour le bonus)
      let bonusAwarded = false;
      
      if (!user.firstAdWatched && !user.signupBonusAwarded) {
        // Attribuer le bonus de première pub
        await supabase
          .from('profiles')
          .update({ 
            first_ad_watched: true,
            signup_bonus_awarded: true,
            balance: user.balance + SIGNUP_BONUS + pointsEarned,
            total_points_earned: user.totalPointsEarned + SIGNUP_BONUS + pointsEarned
          })
          .eq('id', authUser.id);
          
        bonusAwarded = true;
        
        toast.success(`Bonus de bienvenue !`, {
          description: `Vous avez reçu ${SIGNUP_BONUS} points de bonus pour votre première pub.`
        });
      } else {
        // Mise à jour normale du solde
        await supabase
          .from('profiles')
          .update({ 
            balance: user.balance + pointsEarned,
            total_points_earned: user.totalPointsEarned + pointsEarned
          })
          .eq('id', authUser.id);
      }
      
      // Mise à jour locale
      setUser(prev => {
        const bonusPoints = bonusAwarded ? SIGNUP_BONUS : 0;
        const newTotalPoints = prev.totalPointsEarned + pointsEarned + bonusPoints;
        
        let nextLevelProgress = prev.nextLevelProgress;
        if (prev.level === 1) {
          nextLevelProgress = Math.min(newTotalPoints, LEVEL_THRESHOLDS[1]);
        } else if (prev.level === 2) {
          nextLevelProgress = Math.min(newTotalPoints - LEVEL_THRESHOLDS[1], LEVEL_THRESHOLDS[2] - LEVEL_THRESHOLDS[1]);
        }
        
        return {
          ...prev,
          balance: prev.balance + pointsEarned + bonusPoints,
          adsWatchedToday: prev.adsWatchedToday + 1,
          dailyEarnings: prev.dailyEarnings + pointsEarned + bonusPoints,
          firstAdWatched: true,
          signupBonusAwarded: bonusAwarded ? true : prev.signupBonusAwarded,
          totalPointsEarned: newTotalPoints,
          nextLevelProgress
        };
      });
      
      setAdsWatchedToday(prev => prev + 1);
      
      // Vérifier si l'utilisateur peut passer au niveau supérieur
      if (canLevelUp()) {
        await levelUp();
      }
      
    } catch (error) {
      console.error('Error watching ad:', error);
      toast.error("Erreur lors de l'enregistrement de la publicité");
    }
  };

  const awardSignupBonus = async () => {
    if (!authUser || user.signupBonusAwarded) return;
    
    try {
      // Mise à jour en base de données
      const { error } = await supabase
        .from('profiles')
        .update({ 
          signup_bonus_awarded: true,
          balance: user.balance + SIGNUP_BONUS,
          total_points_earned: user.totalPointsEarned + SIGNUP_BONUS
        })
        .eq('id', authUser.id);
        
      if (error) throw error;
      
      // Mise à jour locale
      setUser(prev => ({
        ...prev,
        balance: prev.balance + SIGNUP_BONUS,
        signupBonusAwarded: true,
        totalPointsEarned: prev.totalPointsEarned + SIGNUP_BONUS,
        nextLevelProgress: Math.min(prev.totalPointsEarned + SIGNUP_BONUS, LEVEL_THRESHOLDS[1])
      }));
      
      toast.success(`Bonus de bienvenue !`, {
        description: `Vous avez reçu ${SIGNUP_BONUS} points de bonus pour votre inscription.`
      });
    } catch (error) {
      console.error('Error awarding signup bonus:', error);
    }
  };

  const updateReferrals = async (count: number, earnings: number) => {
    try {
      // Mise à jour en base de données
      const { error } = await supabase
        .from('profiles')
        .update({ 
          referral_count: user.referrals + count,
          balance: user.balance + earnings,
          total_points_earned: user.totalPointsEarned + earnings
        })
        .eq('id', authUser?.id);
        
      if (error) throw error;
      
      // Mise à jour locale
      setUser(prev => ({
        ...prev,
        referrals: prev.referrals + count,
        referralEarnings: prev.referralEarnings + earnings,
        balance: prev.balance + earnings,
        totalPointsEarned: prev.totalPointsEarned + earnings
      }));
      
      toast.success(`Nouveau filleul !`, {
        description: `Vous avez gagné ${earnings} points de parrainage.`
      });
    } catch (error) {
      console.error('Error updating referrals:', error);
    }
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      updateBalance, 
      watchAd, 
      updateReferrals, 
      loadUserProfile,
      awardSignupBonus,
      getPointsPerAd,
      canLevelUp,
      levelUp
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
