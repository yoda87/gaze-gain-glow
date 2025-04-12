
import React, { createContext, useContext, useState, ReactNode } from 'react';

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
}

interface UserContextType {
  user: User;
  updateBalance: (amount: number) => void;
  watchAd: () => void;
}

const initialUser: User = {
  name: 'Thomas',
  balance: 2500, // Points balance
  adsWatchedToday: 3,
  dailyEarnings: 250,
  activeBonus: 'Weekend x2',
  level: 3,
  nextLevelProgress: 75,
  nextLevelTarget: 100,
  referrals: 2,
  referralEarnings: 750,
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(initialUser);

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

  return (
    <UserContext.Provider value={{ user, updateBalance, watchAd }}>
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
