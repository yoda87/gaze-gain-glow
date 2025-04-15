
import React, { useState, useEffect } from 'react';
import { Users, Copy, Share2, Check, Gift } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useUser } from '@/context/UserContext';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';

const Referral = () => {
  const { user, updateReferrals } = useUser();
  const [copied, setCopied] = useState(false);
  const [referralLink, setReferralLink] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  
  useEffect(() => {
    if (user.referralCode) {
      // Use the current origin (based on where the app is running) with the referral code
      setReferralLink(`${window.location.origin}/signup?ref=${user.referralCode}`);
    }
  }, [user.referralCode]);
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    
    toast.success("Lien copié !", {
      description: "Le lien de parrainage a été copié dans votre presse-papier.",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };
  
  const shareReferral = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Rejoins-moi sur Gaze Gain Glow',
        text: 'Utilise mon lien pour t\'inscrire et nous gagnerons tous les deux des points bonus!',
        url: referralLink,
      })
      .catch(error => console.log('Error sharing', error));
    } else {
      copyToClipboard();
    }
  };
  
  // Check for new referrals
  const checkForNewReferral = async () => {
    setIsChecking(true);
    try {
      // In a real app, this would check the database
      // For now, just simulate a new referral (20% chance)
      if (Math.random() < 0.2) {
        updateReferrals(1, 200);
      } else {
        toast.info("Aucun nouveau filleul pour l'instant");
      }
    } catch (error) {
      console.error('Error checking referrals:', error);
      toast.error("Erreur lors de la vérification");
    } finally {
      setIsChecking(false);
    }
  };
  
  return (
    <Layout>
      <div className="container max-w-md mx-auto pt-6 pb-20 px-4">
        <h1 className="text-2xl font-bold mb-2">Parrainage</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Invitez vos amis et gagnez ensemble
        </p>
        
        <Card className="mb-6 bg-gradient-to-br from-brand-purple to-brand-purple/80 text-white border-none">
          <CardContent className="pt-6 pb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-white/20 rounded-full">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Programme de parrainage</h3>
                <p className="text-sm text-white/80">Gagnez 200 points par ami inscrit</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <p className="text-sm text-white/80">Filleuls actifs</p>
                <p className="text-2xl font-bold">{user.referrals}</p>
              </div>
              <div className="bg-white/10 rounded-lg p-3 text-center">
                <p className="text-sm text-white/80">Points gagnés</p>
                <p className="text-2xl font-bold">{user.referralEarnings}</p>
              </div>
            </div>
            
            <Button 
              onClick={checkForNewReferral} 
              className="w-full bg-white text-brand-purple hover:bg-white/90 flex items-center justify-center"
              disabled={isChecking}
            >
              <Gift className="h-4 w-4 mr-2" />
              {isChecking ? 'Vérification...' : 'Vérifier les nouveaux filleuls'}
            </Button>
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Votre lien de parrainage</CardTitle>
            <CardDescription>Partagez ce lien avec vos amis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex mb-4">
              <Input
                value={referralLink}
                readOnly
                className="rounded-r-none"
              />
              <Button
                onClick={copyToClipboard}
                variant="outline"
                className="rounded-l-none border-l-0"
              >
                {copied ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                onClick={copyToClipboard}
                className="flex items-center"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copier
              </Button>
              <Button
                onClick={shareReferral}
                className="flex items-center bg-gradient-to-br from-brand-purple to-brand-purple/80"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Partager
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Comment ça marche</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="bg-brand-purple/10 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                  <span className="text-brand-purple font-semibold">1</span>
                </div>
                <div>
                  <p className="font-medium">Partagez votre lien</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Envoyez votre lien de parrainage à vos amis
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="bg-brand-purple/10 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                  <span className="text-brand-purple font-semibold">2</span>
                </div>
                <div>
                  <p className="font-medium">Ils s'inscrivent</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Vos amis créent un compte via votre lien
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="bg-brand-purple/10 rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
                  <span className="text-brand-purple font-semibold">3</span>
                </div>
                <div>
                  <p className="font-medium">Vous gagnez tous les deux</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Recevez 200 points pour chaque ami qui s'inscrit
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Referral;
