
import React from 'react';
import { ChevronRight, BellRing, Moon, Sun, Eye, Lock, Languages, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useUser } from '@/context/UserContext';
import Layout from '@/components/Layout';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Settings = () => {
  const { user } = useUser();
  const { toast } = useToast();
  
  const handleSavePreference = () => {
    toast({
      title: "Préférence enregistrée",
      description: "Vos réglages ont été mis à jour",
    });
  };
  
  return (
    <Layout>
      <div className="container max-w-md mx-auto pt-6 pb-20 px-4">
        <h1 className="text-2xl font-bold mb-6">Paramètres</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Notifications</CardTitle>
            <CardDescription>Gérez vos alertes et notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BellRing className="h-5 w-5 text-brand-purple" />
                <div>
                  <p className="font-medium">Notifications push</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Recevez des alertes sur votre appareil</p>
                </div>
              </div>
              <Switch defaultChecked onCheckedChange={handleSavePreference} />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <BellRing className="h-5 w-5 text-brand-purple" />
                <div>
                  <p className="font-medium">Emails promotionnels</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Recevez nos offres spéciales</p>
                </div>
              </div>
              <Switch onCheckedChange={handleSavePreference} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Apparence</CardTitle>
            <CardDescription>Personnalisez l'apparence de l'application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sun className="h-5 w-5 text-brand-purple" />
                <div>
                  <p className="font-medium">Thème clair</p>
                </div>
              </div>
              <Switch defaultChecked onCheckedChange={handleSavePreference} />
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Eye className="h-5 w-5 text-brand-purple" />
                <div>
                  <p className="font-medium">Mode économie de données</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Réduit l'utilisation des données</p>
                </div>
              </div>
              <Switch onCheckedChange={handleSavePreference} />
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Sécurité</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="ghost" className="w-full justify-between" asChild>
              <Link to="/settings/security/password">
                <div className="flex items-center">
                  <Lock className="mr-2 h-5 w-5 text-brand-purple" />
                  Changer le mot de passe
                </div>
                <ChevronRight className="h-5 w-5" />
              </Link>
            </Button>
            
            <Button variant="ghost" className="w-full justify-between" asChild>
              <Link to="/settings/security/privacy">
                <div className="flex items-center">
                  <Eye className="mr-2 h-5 w-5 text-brand-purple" />
                  Confidentialité
                </div>
                <ChevronRight className="h-5 w-5" />
              </Link>
            </Button>
            
            <Button variant="ghost" className="w-full justify-between" asChild>
              <Link to="/settings/security/language">
                <div className="flex items-center">
                  <Languages className="mr-2 h-5 w-5 text-brand-purple" />
                  Langue (Français)
                </div>
                <ChevronRight className="h-5 w-5" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Settings;
