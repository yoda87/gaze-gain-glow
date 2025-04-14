
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
import { AtSign, Eye, EyeOff, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';

const loginSchema = z.object({
  email: z.string().email({ message: "Adresse email invalide" }),
  password: z.string().min(1, { message: "Le mot de passe est requis" }),
});

type LoginFormData = z.infer<typeof loginSchema>;

const Login = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { isAuthenticated } = useAuth();

  // Redirect to home if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    }
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      // Login with Supabase
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        throw error;
      }
      
      // No need to navigate here as AuthContext will handle this
      // when it detects the SIGNED_IN event
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('Erreur de connexion', {
        description: 'Email ou mot de passe incorrect.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePassword = () => setShowPassword(!showPassword);

  return (
    <Layout hideNav>
      <div className="container max-w-md mx-auto pt-12 pb-20 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-brand-purple">Connexion</h1>
          <p className="text-gray-600">Connectez-vous pour accéder à votre compte</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Se connecter</CardTitle>
            <CardDescription>Entrez vos identifiants pour vous connecter</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Connexion en cours...' : 'Se connecter'}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <p className="text-sm text-gray-600">
              Vous n'avez pas de compte ?{' '}
              <Link to="/signup" className="text-brand-purple font-medium hover:underline">
                Inscrivez-vous
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </Layout>
  );
};

export default Login;
