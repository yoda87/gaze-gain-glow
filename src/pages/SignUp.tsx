
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Layout from '@/components/Layout';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { AtSign, Eye, EyeOff, Lock, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';

const signUpSchema = z.object({
  email: z.string().email({ message: "Adresse email invalide" }),
  password: z.string().min(6, { message: "Le mot de passe doit faire au moins 6 caractères" }),
  confirmPassword: z.string(),
  name: z.string().min(2, { message: "Le nom doit avoir au moins 2 caractères" })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"]
});

type SignUpFormData = z.infer<typeof signUpSchema>;

const SignUp = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { isAuthenticated } = useAuth();

  // Redirect to home if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      name: ''
    }
  });

  const onSubmit = async (data: SignUpFormData) => {
    setIsSubmitting(true);
    try {
      // Sign up with Supabase
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name
          },
          emailRedirectTo: window.location.origin
        }
      });

      if (error) {
        throw error;
      }

      toast.success('Inscription réussie !', {
        description: 'Votre compte a été créé avec succès.'
      });
      
      // No need to navigate here as AuthContext will handle this
      // when it detects the SIGNED_IN event
    } catch (error: any) {
      console.error('Signup error:', error);
      if (error.message.includes('already registered')) {
        toast.error('Erreur d\'inscription', {
          description: 'Cette adresse email est déjà utilisée.'
        });
      } else {
        toast.error('Erreur d\'inscription', {
          description: error.message || 'Une erreur est survenue, veuillez réessayer.'
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePassword = () => setShowPassword(!showPassword);
  const toggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  return (
    <Layout hideNav>
      <div className="container max-w-md mx-auto pt-12 pb-20 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-brand-purple">Inscription</h1>
          <p className="text-gray-600">Créez votre compte pour commencer à gagner des récompenses</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Créer un compte</CardTitle>
            <CardDescription>Remplissez le formulaire ci-dessous pour vous inscrire</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom complet</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                          <Input placeholder="Votre nom" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                          <Input placeholder="votre@email.com" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mot de passe</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Votre mot de passe" 
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
                            placeholder="Confirmer votre mot de passe" 
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

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Inscription en cours...' : 'S\'inscrire'}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center">
            <p className="text-sm text-gray-600">
              Vous avez déjà un compte ?{' '}
              <Link to="/login" className="text-brand-purple font-medium hover:underline">
                Connectez-vous
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default SignUp;
