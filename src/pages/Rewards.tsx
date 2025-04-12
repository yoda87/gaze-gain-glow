
import React, { useState } from 'react';
import { Wallet, Gift, CreditCard, Bitcoin, FileText, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { useUser } from '@/context/UserContext';
import Layout from '@/components/Layout';

const Rewards = () => {
  const { user, updateBalance } = useUser();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  
  const handleRedeem = () => {
    if (!selectedAmount) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un montant à retirer.",
        variant: "destructive",
      });
      return;
    }
    
    if (selectedAmount > user.balance) {
      toast({
        title: "Solde insuffisant",
        description: "Vous n'avez pas assez de points pour cette récompense.",
        variant: "destructive",
      });
      return;
    }
    
    // Simulate reward redemption
    updateBalance(-selectedAmount);
    
    toast({
      title: "Récompense demandée !",
      description: `Votre retrait de ${selectedAmount} points a été validé. Livraison sous 24-48h.`,
    });
    
    setSelectedAmount(null);
  };
  
  return (
    <Layout>
      <div className="container max-w-md mx-auto pt-6 pb-20 px-4">
        <h1 className="text-2xl font-bold mb-2">Récompenses</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Convertissez vos {user.balance} points en récompenses
        </p>
        
        <Tabs defaultValue="paypal" className="mb-6">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="paypal" className="flex flex-col items-center py-3">
              <Wallet className="h-5 w-5 mb-1" />
              <span className="text-xs">PayPal</span>
            </TabsTrigger>
            <TabsTrigger value="gift" className="flex flex-col items-center py-3">
              <Gift className="h-5 w-5 mb-1" />
              <span className="text-xs">Cartes</span>
            </TabsTrigger>
            <TabsTrigger value="crypto" className="flex flex-col items-center py-3">
              <Bitcoin className="h-5 w-5 mb-1" />
              <span className="text-xs">Crypto</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex flex-col items-center py-3">
              <FileText className="h-5 w-5 mb-1" />
              <span className="text-xs">Historique</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="paypal" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Retrait PayPal</CardTitle>
                <CardDescription>Transférez vos points vers votre compte PayPal</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={selectedAmount === 1000 ? "default" : "outline"}
                      className={selectedAmount === 1000 ? "border-2 border-brand-purple" : ""}
                      onClick={() => setSelectedAmount(1000)}
                    >
                      1000 points = 5€
                    </Button>
                    <Button
                      variant={selectedAmount === 2000 ? "default" : "outline"}
                      className={selectedAmount === 2000 ? "border-2 border-brand-purple" : ""}
                      onClick={() => setSelectedAmount(2000)}
                    >
                      2000 points = 10€
                    </Button>
                    <Button
                      variant={selectedAmount === 4000 ? "default" : "outline"}
                      className={selectedAmount === 4000 ? "border-2 border-brand-purple" : ""}
                      onClick={() => setSelectedAmount(4000)}
                    >
                      4000 points = 20€
                    </Button>
                    <Button
                      variant={selectedAmount === 10000 ? "default" : "outline"}
                      className={selectedAmount === 10000 ? "border-2 border-brand-purple" : ""}
                      onClick={() => setSelectedAmount(10000)}
                    >
                      10000 points = 50€
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email PayPal</label>
                    <Input placeholder="votre-email@exemple.com" />
                  </div>
                  
                  <Button 
                    onClick={handleRedeem} 
                    className="w-full bg-gradient-to-br from-brand-purple to-brand-purple/80"
                  >
                    Valider le retrait
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="gift" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <RewardCard 
                title="Amazon" 
                image="https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/2560px-Amazon_logo.svg.png"
                points={2000}
                value="10€"
                onClick={() => setSelectedAmount(2000)}
                selected={selectedAmount === 2000}
              />
              <RewardCard 
                title="Netflix" 
                image="https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/2560px-Netflix_2015_logo.svg.png"
                points={3000}
                value="15€"
                onClick={() => setSelectedAmount(3000)}
                selected={selectedAmount === 3000}
              />
              <RewardCard 
                title="Spotify" 
                image="https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Spotify_logo_with_text.svg/2560px-Spotify_logo_with_text.svg.png"
                points={2000}
                value="10€"
                onClick={() => setSelectedAmount(2000)}
                selected={selectedAmount === 2000}
              />
              <RewardCard 
                title="Steam" 
                image="https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Steam_icon_logo.svg/2048px-Steam_icon_logo.svg.png"
                points={5000}
                value="25€"
                onClick={() => setSelectedAmount(5000)}
                selected={selectedAmount === 5000}
              />
            </div>
            
            <Button 
              onClick={handleRedeem} 
              className="w-full bg-gradient-to-br from-brand-purple to-brand-purple/80"
            >
              Valider la carte cadeau
            </Button>
          </TabsContent>
          
          <TabsContent value="crypto" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Retrait en Crypto</CardTitle>
                <CardDescription>Transférez vos points en cryptomonnaies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={selectedAmount === 5000 ? "default" : "outline"}
                      className={selectedAmount === 5000 ? "border-2 border-brand-purple" : ""}
                      onClick={() => setSelectedAmount(5000)}
                    >
                      5000 points = 0.001 BTC
                    </Button>
                    <Button
                      variant={selectedAmount === 3000 ? "default" : "outline"}
                      className={selectedAmount === 3000 ? "border-2 border-brand-purple" : ""}
                      onClick={() => setSelectedAmount(3000)}
                    >
                      3000 points = 0.01 ETH
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Adresse de portefeuille</label>
                    <Input placeholder="Adresse de votre wallet" />
                  </div>
                  
                  <Button 
                    onClick={handleRedeem} 
                    className="w-full bg-gradient-to-br from-brand-purple to-brand-purple/80"
                  >
                    Valider le retrait
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Historique des retraits</CardTitle>
                <CardDescription>Vos récompenses précédentes</CardDescription>
              </CardHeader>
              <CardContent>
                {[
                  { date: '15/04/2025', type: 'PayPal', amount: '5€', status: 'Complété' },
                  { date: '28/03/2025', type: 'Amazon', amount: '10€', status: 'Complété' },
                  { date: '12/03/2025', type: 'PayPal', amount: '20€', status: 'Complété' },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between py-3 border-b last:border-0">
                    <div>
                      <p className="font-medium">{item.type}</p>
                      <p className="text-sm text-gray-500">{item.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{item.amount}</p>
                      <p className="text-sm text-green-600">{item.status}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

interface RewardCardProps {
  title: string;
  image: string;
  points: number;
  value: string;
  onClick: () => void;
  selected: boolean;
}

const RewardCard = ({ title, image, points, value, onClick, selected }: RewardCardProps) => {
  return (
    <Card 
      className={`cursor-pointer transition-all hover:scale-105 ${selected ? 'border-2 border-brand-purple' : ''}`}
      onClick={onClick}
    >
      <CardContent className="p-3 flex flex-col items-center">
        <div className="h-12 flex items-center justify-center mb-2">
          <img src={image} alt={title} className="max-h-full max-w-full" />
        </div>
        <p className="font-semibold">{title}</p>
        <p className="text-xs text-gray-600">{points} points</p>
        <p className="text-sm font-medium">{value}</p>
      </CardContent>
    </Card>
  );
};

export default Rewards;
