
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from '@/components/ui/input-otp';
import { useAuth } from '@/context/AuthContext';
import { Mail, ArrowRight, RefreshCw, Home } from 'lucide-react';

const EmailVerification = () => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const email = location.state?.email || user?.email || '';
  
  useEffect(() => {
    if (!email) {
      navigate('/signup');
      toast.error('Email invalide', {
        description: 'Veuillez vous inscrire à nouveau'
      });
    }
  }, [email, navigate]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && resendDisabled) {
      setResendDisabled(false);
    }
  }, [countdown, resendDisabled]);

  const handleVerify = async () => {
    if (verificationCode.length !== 5) {
      toast.error('Code invalide', {
        description: 'Veuillez entrer le code à 5 chiffres complet'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Check verification code against Supabase
      const { data, error } = await supabase.functions.invoke('verify-email', {
        body: { email, code: verificationCode }
      });

      if (error || !data?.success) {
        throw new Error(error?.message || 'Code de vérification incorrect');
      }

      // Mark the user as verified in the database
      // Use a try-catch to avoid issues if email_verified column doesn't exist yet
      try {
        await supabase.from('profiles').update({
          email_verified: true
        }).eq('id', user?.id);
      } catch (err) {
        console.error('Error updating profile:', err);
        // Continue anyway since the edge function already verified the user
      }

      toast.success('Email vérifié avec succès!', {
        description: 'Vous pouvez maintenant accéder à votre compte'
      });
      
      navigate('/');
    } catch (error: any) {
      console.error('Verification error:', error);
      toast.error('Erreur de vérification', {
        description: error.message || 'Veuillez réessayer'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    setResendDisabled(true);
    setCountdown(60); // 60 seconds cooldown
    
    try {
      // Call the resend code function
      const { error } = await supabase.functions.invoke('send-verification-code', {
        body: { email }
      });
      
      if (error) throw error;
      
      toast.success('Code envoyé!', {
        description: `Un nouveau code a été envoyé à ${email}`
      });
    } catch (error: any) {
      console.error('Error resending code:', error);
      toast.error('Erreur d\'envoi', {
        description: error.message || 'Impossible d\'envoyer le code'
      });
    }
  };

  const handleSkipVerification = () => {
    toast.info('Vérification reportée', {
      description: 'Vous pourrez vérifier votre email plus tard'
    });
    navigate('/');
  };

  return (
    <Layout hideNav>
      <div className="container max-w-md mx-auto pt-12 pb-20 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-brand-purple">Vérification</h1>
          <p className="text-gray-600">Vérifiez votre email pour continuer</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Vérifier votre email</CardTitle>
            <CardDescription>
              Un code à 5 chiffres a été envoyé à {email}. Veuillez l'entrer ci-dessous.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-center py-4">
              <Mail className="h-12 w-12 text-brand-purple" />
            </div>
            
            <div className="flex justify-center mb-6">
              <InputOTP 
                maxLength={5}
                value={verificationCode}
                onChange={setVerificationCode}
                render={({ slots }) => (
                  <InputOTPGroup>
                    {slots.map((slot, index) => (
                      <InputOTPSlot key={index} {...slot} index={index} />
                    ))}
                  </InputOTPGroup>
                )}
              />
            </div>

            <Button 
              onClick={handleVerify} 
              className="w-full"
              disabled={isSubmitting || verificationCode.length !== 5}
            >
              {isSubmitting ? 'Vérification...' : 'Vérifier'} {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-center w-full">
              <p className="text-gray-600 mb-2">
                Vous n'avez pas reçu le code?
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleResendCode}
                disabled={resendDisabled}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                {resendDisabled ? `Réessayer dans ${countdown}s` : 'Renvoyer le code'}
              </Button>
            </div>
            
            <div className="mt-4 w-full">
              <Button 
                variant="ghost" 
                className="w-full text-gray-600"
                onClick={handleSkipVerification}
              >
                <Home className="mr-2 h-4 w-4" />
                Continuer sans vérifier
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default EmailVerification;
