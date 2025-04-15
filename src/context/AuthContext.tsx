
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
  isEmailVerified: boolean;
}

const AuthContext = createContext<AuthContextProps>({
  user: null,
  session: null,
  isLoading: true,
  signOut: async () => {},
  isAuthenticated: false,
  isEmailVerified: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const navigate = useNavigate();

  // Check email verification status
  const checkEmailVerification = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('email_verified')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      
      // Check if the email_verified property exists before using it
      setIsEmailVerified(data && data.email_verified ? true : false);
      
      // If not verified, redirect to verification page
      if (data && !data.email_verified && user?.email) {
        toast.info('Veuillez vérifier votre email', {
          description: 'Confirmez votre adresse email pour accéder à toutes les fonctionnalités'
        });
        
        navigate('/verify-email', { state: { email: user.email } });
      }
    } catch (error) {
      console.error('Error checking email verification:', error);
    }
  };

  useEffect(() => {
    console.log('AuthProvider initializing...');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsAuthenticated(!!currentSession);
        setIsLoading(false);
        
        // If signed in, check email verification
        if (currentSession?.user) {
          checkEmailVerification(currentSession.user.id);
        }
        
        if (event === 'SIGNED_IN') {
          toast.success('Connexion réussie !');
          // Use setTimeout to prevent auth deadlocks
          setTimeout(() => {
            navigate('/');
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          toast.info('Vous êtes déconnecté');
          // Use setTimeout to prevent auth deadlocks
          setTimeout(() => {
            navigate('/login');
          }, 0);
        }
      }
    );

    // THEN check for existing session
    const checkSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log('Existing session:', currentSession);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsAuthenticated(!!currentSession);
        
        // If signed in, check email verification
        if (currentSession?.user) {
          checkEmailVerification(currentSession.user.id);
        }
        
        // If user is authenticated but on login or signup page, redirect to home
        if (currentSession && (window.location.pathname === '/login' || window.location.pathname === '/signup')) {
          navigate('/');
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      // We don't need to navigate here as the onAuthStateChange listener will handle it
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      toast.error('Erreur lors de la déconnexion');
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signOut, isAuthenticated, isEmailVerified }}>
      {children}
    </AuthContext.Provider>
  );
};
