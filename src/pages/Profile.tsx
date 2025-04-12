
import React from 'react';
import { User, Bell, CreditCard, Settings, HelpCircle, LogOut } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useUser } from '@/context/UserContext';
import Layout from '@/components/Layout';

const Profile = () => {
  const { user } = useUser();
  
  return (
    <Layout>
      <div className="container max-w-md mx-auto pt-6 pb-20 px-4">
        <h1 className="text-2xl font-bold mb-6">Profil</h1>
        
        <Card className="mb-6">
          <CardContent className="pt-6 flex items-center gap-4">
            <div className="bg-gradient-to-br from-brand-purple to-brand-purple/80 h-16 w-16 rounded-full flex items-center justify-center text-white">
              <User className="h-8 w-8" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-gray-600 dark:text-gray-400">Membre depuis Avril 2025</p>
              <div className="flex items-center gap-1 mt-1">
                <div className="bg-brand-purple/10 px-2 py-0.5 rounded-full text-xs text-brand-purple font-medium">
                  Niveau {user.level}
                </div>
                <div className="bg-brand-gold/10 px-2 py-0.5 rounded-full text-xs text-brand-gold font-medium">
                  Premium
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Préférences</CardTitle>
            <CardDescription>Personnalisez votre expérience</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-brand-purple" />
                <div>
                  <p className="font-medium">Notifications</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Alertes et rappels</p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-brand-purple" />
                <div>
                  <p className="font-medium">Récompenses automatiques</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Convertir en PayPal à 10€</p>
                </div>
              </div>
              <Switch />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Settings className="h-5 w-5 text-brand-purple" />
                <div>
                  <p className="font-medium">Publicités personnalisées</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Basées sur vos intérêts</p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Aide & Support</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="ghost" className="w-full justify-start">
              <HelpCircle className="mr-2 h-5 w-5 text-brand-purple" />
              Centre d'aide
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <User className="mr-2 h-5 w-5 text-brand-purple" />
              Contactez-nous
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              <Settings className="mr-2 h-5 w-5 text-brand-purple" />
              Paramètres du compte
            </Button>
          </CardContent>
        </Card>
        
        <Button variant="outline" className="w-full text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600">
          <LogOut className="mr-2 h-5 w-5" />
          Déconnexion
        </Button>
      </div>
    </Layout>
  );
};

export default Profile;
