
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Lock, Eye, EyeOff, ArrowRight, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from '@/components/ui/input-otp';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

const resetPasswordSchema = z.object({
  password: z.string()
    .min(8, { message: "Le mot de passe doit contenir au moins 8 caractères" })
    .regex(/[A-Z]/, { message: "Le mot de passe doit contenir au moins une majuscule" })
    .regex(/[a-z]/, { message: "Le mot de passe doit contenir au moins une minuscule" })
    .regex(/[0-9]/, { message: "Le mot de passe doit contenir au moins un chiffre" }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;
  
  const [verificationCode, setVerificationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCodeVerified, setIsCodeVerified] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);

  // Redirect if no email in state
  useEffect(() => {
    if (!email) {
      navigate('/forgot-password');
      toast.error('Information manquante', {
        description: 'Veuillez recommencer le processus'
      });
    }
  }, [email, navigate]);

  // Countdown for resend code
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && resendDisabled) {
      setResendDisabled(false);
    }
  }, [countdown, resendDisabled]);

  const form = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    }
  });

  const togglePassword = () => setShowPassword(!showPassword);
  const toggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  const handleVerifyCode = async () => {
    if (verificationCode.length !== 5) {
      toast.error('Code invalide', {
        description: 'Veuillez entrer le code à 5 chiffres complet'
      });
      return;
    }

    setIsVerifying(true);
    try {
      // Check verification code
      const { data, error } = await supabase.functions.invoke('verify-code', {
        body: { 
          email,
          code: verificationCode,
          purpose: 'password-reset'
        }
      });

      if (error || !data?.success) {
        throw new Error(error?.message || 'Code de vérification incorrect');
      }

      setIsCodeVerified(true);
      toast.success('Code vérifié !', {
        description: 'Vous pouvez maintenant réinitialiser votre mot de passe'
      });
    } catch (error: any) {
      console.error('Verification error:', error);
      toast.error('Erreur de vérification', {
        description: error.message || 'Veuillez réessayer'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    setResendDisabled(true);
    setCountdown(60);
    
    try {
      const { error } = await supabase.functions.invoke('send-verification-code', {
        body: { 
          email,
          purpose: 'password-reset'
        }
      });
      
      if (error) throw error;
      
      toast.success('Code envoyé !', {
        description: `Un nouveau code a été envoyé à ${email}`
      });
    } catch (error: any) {
      console.error('Error resending code:', error);
      toast.error('Erreur d\'envoi', {
        description: error.message || 'Impossible d\'envoyer le code'
      });
    }
  };

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!isCodeVerified) {
      toast.error('Code non vérifié', {
        description: 'Veuillez vérifier le code avant de réinitialiser le mot de passe'
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Update user password
      const { error } = await supabase.auth.updateUser({
        password: data.password
      });

      if (error) throw error;

      // Show success dialog
      setSuccessDialogOpen(true);
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast.error('Erreur de réinitialisation', {
        description: error.message || 'Impossible de réinitialiser le mot de passe'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessClose = () => {
    setSuccessDialogOpen(false);
    navigate('/login');
  };

  return (
    <Layout hideNav>
      <div className="container max-w-md mx-auto pt-12 pb-20 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-brand-purple">Réinitialisation</h1>
          <p className="text-gray-600">Réinitialisez votre mot de passe</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Nouveau mot de passe</CardTitle>
            <CardDescription>
              {!isCodeVerified 
                ? `Entrez le code à 5 chiffres envoyé à ${email}`
                : 'Créez un nouveau mot de passe sécurisé'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isCodeVerified ? (
              <div className="space-y-4">
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
                  onClick={handleVerifyCode} 
                  className="w-full"
                  disabled={isVerifying || verificationCode.length !== 5}
                >
                  {isVerifying ? 'Vérification...' : 'Vérifier le code'} 
                  {!isVerifying && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>

                <div className="text-sm text-center">
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
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nouveau mot de passe</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                            <Input 
                              type={showPassword ? "text" : "password"} 
                              placeholder="Entrez un nouveau mot de passe" 
                              className="pl-10" 
                              {...field} 
                            />
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon"
                              className="absolute right-1 top-1/2 -translate-y-1/2"
                              onClick={togglePassword}
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmer le mot de passe</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                            <Input 
                              type={showConfirmPassword ? "text" : "password"} 
                              placeholder="Confirmez votre mot de passe" 
                              className="pl-10" 
                              {...field} 
                            />
                            <Button 
                              type="button" 
                              variant="ghost" 
                              size="icon"
                              className="absolute right-1 top-1/2 -translate-y-1/2"
                              onClick={toggleConfirmPassword}
                            >
                              {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'} 
                    {!isSubmitting && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate('/login')}
            >
              Retour à la connexion
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Success dialog */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mot de passe réinitialisé</DialogTitle>
            <DialogDescription>
              Votre mot de passe a été réinitialisé avec succès.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleSuccessClose}>
              Se connecter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ResetPassword;
