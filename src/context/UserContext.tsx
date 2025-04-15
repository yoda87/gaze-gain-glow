
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface User {
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
}

interface UserContextType {
  user: User;
  updateBalance: (amount: number) => void;
  watchAd: () => void;
  updateReferrals: (count: number, earnings: number) => void;
  loadUserProfile: () => Promise<void>;
}

// Initial state with zero balance for new users
const initialUser: User = {
  name: '',
  balance: 0, // Starting balance set to 0
  adsWatchedToday: 0,
  dailyEarnings: 0,
  activeBonus: null,
  level: 1,
  nextLevelProgress: 0,
  nextLevelTarget: 100,
  referrals: 0,
  referralEarnings: 0,
  referralCode: ''
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(initialUser);
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

        // Generate a referral code based on user ID
        const referralCode = authUser.id.substring(0, 8);
        
        // Update user state with data from Supabase
        setUser(prev => ({
          ...prev,
          name: authUser.user_metadata.name || data?.name || 'Utilisateur',
          // Check if the balance property exists on data
          balance: data && typeof data.balance === 'number' ? data.balance : 0,
          referralCode,
          // Add payment history if available
          // Check if referrals and referral_earnings exist on data
          referrals: data && typeof data.referrals === 'number' ? data.referrals : 0,
          referralEarnings: data && typeof data.referral_earnings === 'number' ? data.referral_earnings : 0
        }));
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

  const updateBalance = (amount: number) => {
    setUser(prev => ({
      ...prev,
      balance: prev.balance + amount,
      dailyEarnings: prev.dailyEarnings + amount
    }));
  };

  const watchAd = () => {
    // Simulate watching an ad - increase balance, ads watched, and level progress
    const pointsEarned = user.activeBonus === 'Weekend x2' ? 100 : 50;
    
    setUser(prev => {
      const newAdsWatchedToday = prev.adsWatchedToday + 1;
      const initialLevelProgress = Math.min(prev.nextLevelProgress + 5, prev.nextLevelTarget);
      const newLevel = initialLevelProgress === prev.nextLevelTarget ? prev.level + 1 : prev.level;
      const newNextLevelTarget = initialLevelProgress === prev.nextLevelTarget ? prev.nextLevelTarget + 25 : prev.nextLevelTarget;
      const newNextLevelProgress = initialLevelProgress === prev.nextLevelTarget ? 0 : initialLevelProgress;
      
      return {
        ...prev,
        balance: prev.balance + pointsEarned,
        adsWatchedToday: newAdsWatchedToday,
        dailyEarnings: prev.dailyEarnings + pointsEarned,
        level: newLevel,
        nextLevelProgress: newNextLevelProgress,
        nextLevelTarget: newNextLevelTarget
      };
    });
  };

  const updateReferrals = (count: number, earnings: number) => {
    setUser(prev => ({
      ...prev,
      referrals: prev.referrals + count,
      referralEarnings: prev.referralEarnings + earnings,
      balance: prev.balance + earnings
    }));
    
    toast.success(`Nouveau filleul !`, {
      description: `Vous avez gagné ${earnings} points de parrainage.`
    });
  };

  return (
    <UserContext.Provider value={{ user, updateBalance, watchAd, updateReferrals, loadUserProfile }}>
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
