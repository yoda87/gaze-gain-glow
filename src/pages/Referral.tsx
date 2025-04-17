
import React, { useState, useEffect } from 'react';
import { Users, Copy, Share2, Check, Gift, Smartphone } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useUser } from '@/context/UserContext';
import Layout from '@/components/Layout';
import { useDevice } from '@/hooks/use-device';
import { useIsMobile } from '@/hooks/use-mobile';

const Referral = () => {
  const { user, updateReferrals } = useUser();
  const [copied, setCopied] = useState(false);
  const [referralLink, setReferralLink] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const { isNative } = useDevice();
  const isMobile = useIsMobile();
  
  useEffect(() => {
    if (user.referralCode) {
      // Set both the link and the plain code
      setReferralLink(`${window.location.origin}/signup?ref=${user.referralCode}`);
      setReferralCode(user.referralCode);
    }
  }, [user.referralCode]);
  
  const copyToClipboard = (text: string, type: 'link' | 'code') => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    
    toast.success(type === 'link' ? "Lien copié !" : "Code copié !", {
      description: type === 'link' 
        ? "Le lien de parrainage a été copié dans votre presse-papier."
        : "Le code de parrainage a été copié dans votre presse-papier.",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };
  
  const shareReferral = () => {
    const shareText = `Rejoins-moi sur PubCash avec mon code de parrainage : ${referralCode}. Ou utilise ce lien : ${referralLink}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Rejoins-moi sur PubCash',
        text: shareText,
        url: referralLink,
      })
      .catch(error => console.log('Error sharing', error));
    } else {
      copyToClipboard(referralLink, 'link');
    }
  };
  
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
      <div className="container max-w-md mx-auto pt-4 pb-20 px-4">
        <h1 className="text-2xl font-bold mb-2">Parrainage</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Invitez vos amis et gagnez ensemble
        </p>
        
        <Card className="mb-6 bg-gradient-to-br from-brand-purple to-brand-purple/80 text-white border-none shadow-md">
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
        
        {/* Code de parrainage (option mobile optimisée) */}
        <Card className="mb-6 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <Smartphone className="h-5 w-5 mr-2 text-brand-purple" />
              Votre code de parrainage
            </CardTitle>
            <CardDescription>Partagez ce code avec vos amis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex mb-4">
              <Input
                value={referralCode}
                readOnly
                className="rounded-r-none text-center font-bold text-lg tracking-widest"
              />
              <Button
                onClick={() => copyToClipboard(referralCode, 'code')}
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
            
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => copyToClipboard(referralCode, 'code')}
                className="flex items-center justify-center"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copier code
              </Button>
              <Button
                onClick={shareReferral}
                className="flex items-center justify-center bg-gradient-to-br from-brand-purple to-brand-purple/80"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Partager
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Lien de parrainage (conservé mais optimisé) */}
        <Card className="mb-6 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Votre lien de parrainage</CardTitle>
            <CardDescription>Alternative au code, partagez ce lien</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex mb-4">
              <Input
                value={referralLink}
                readOnly
                className="rounded-r-none text-xs"
              />
              <Button
                onClick={() => copyToClipboard(referralLink, 'link')}
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
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
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
                  <p className="font-medium">Partagez votre code</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Envoyez votre code de parrainage à vos amis
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
                    Vos amis utilisent votre code lors de l'inscription
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
