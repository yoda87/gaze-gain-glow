
import React, { useState } from 'react';
import { Wallet, Gift, CreditCard, Bitcoin, FileText, ArrowRight, Phone } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUser } from '@/context/UserContext';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const Rewards = () => {
  const { user, updateBalance, loadUserProfile } = useUser();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<'paypal' | 'orange_money'>('paypal');
  const [paymentEmail, setPaymentEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  
  // Conversion des points en euros
  const pointsToEuros = (points: number): number => {
    return points / 1000 * 0.1; // 1000 points = 0,10€
  };
  
  // Points minimum pour un retrait
  const minWithdrawalPoints = 25000; // 2,50€
  
  const handleRedeem = async () => {
    if (!selectedAmount) {
      toast.error("Veuillez sélectionner un montant à retirer.");
      return;
    }
    
    if (selectedAmount > user.balance) {
      toast.error("Solde insuffisant pour cette récompense.");
      return;
    }
    
    if (selectedAmount < minWithdrawalPoints) {
      toast.error(`Le montant minimum de retrait est de ${minWithdrawalPoints} points (${pointsToEuros(minWithdrawalPoints)}€).`);
      return;
    }
    
    if (selectedMethod === 'paypal' && !paymentEmail) {
      toast.error("Veuillez saisir votre email PayPal.");
      return;
    }
    
    if (selectedMethod === 'orange_money' && !phoneNumber) {
      toast.error("Veuillez saisir votre numéro de téléphone.");
      return;
    }
    
    try {
      setIsRedeeming(true);
      
      // Créer le retrait dans la base de données
      const { error } = await supabase
        .from('withdrawals')
        .insert({
          user_id: user.id, // Assurez-vous que l'ID utilisateur est disponible
          amount_points: selectedAmount,
          amount_euros: pointsToEuros(selectedAmount),
          payment_method: selectedMethod,
          payment_details: selectedMethod === 'paypal' 
            ? { email: paymentEmail } 
            : { phone: phoneNumber }
        });
        
      if (error) throw error;
      
      // Déduire les points du solde utilisateur
      await updateBalance(-selectedAmount);
      
      // Recharger le profil utilisateur
      await loadUserProfile();
      
      toast.success("Retrait demandé !", {
        description: `Votre retrait de ${pointsToEuros(selectedAmount)}€ a été validé. Traitement sous 24-48h.`
      });
      
      // Réinitialiser le formulaire
      setSelectedAmount(null);
      setPaymentEmail('');
      setPhoneNumber('');
      
    } catch (error) {
      console.error('Error redeeming reward:', error);
      toast.error("Erreur lors de la demande de retrait.");
    } finally {
      setIsRedeeming(false);
    }
  };
  
  const isWithdrawalPossible = user.balance >= minWithdrawalPoints;
  
  // Get previous withdrawals
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  
  React.useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        const { data, error } = await supabase
          .from('withdrawals')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setWithdrawals(data || []);
      } catch (error) {
        console.error('Error fetching withdrawals:', error);
      } finally {
        setIsLoadingHistory(false);
      }
    };
    
    fetchWithdrawals();
  }, []);
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', { 
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
  };
  
  // Format withdrawal status
  const formatStatus = (status: string): { text: string, color: string } => {
    switch (status) {
      case 'pending':
        return { text: 'En attente', color: 'text-yellow-600' };
      case 'processing':
        return { text: 'En traitement', color: 'text-blue-600' };
      case 'completed':
        return { text: 'Complété', color: 'text-green-600' };
      case 'rejected':
        return { text: 'Refusé', color: 'text-red-600' };
      default:
        return { text: status, color: 'text-gray-600' };
    }
  };
  
  return (
    <Layout>
      <div className="container max-w-md mx-auto pt-6 pb-20 px-4">
        <h1 className="text-2xl font-bold mb-2">Récompenses</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Convertissez vos {user.balance} points en récompenses
        </p>
        
        <Tabs defaultValue="paypal" className="mb-6">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="paypal" className="flex flex-col items-center py-3">
              <Wallet className="h-5 w-5 mb-1" />
              <span className="text-xs">PayPal</span>
            </TabsTrigger>
            <TabsTrigger value="orange_money" className="flex flex-col items-center py-3">
              <Phone className="h-5 w-5 mb-1" />
              <span className="text-xs">Orange Money</span>
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
                      variant={selectedAmount === 25000 ? "default" : "outline"}
                      className={selectedAmount === 25000 ? "border-2 border-brand-purple" : ""}
                      onClick={() => {
                        setSelectedMethod('paypal');
                        setSelectedAmount(25000);
                      }}
                    >
                      25000 points = 2,50€
                    </Button>
                    <Button
                      variant={selectedAmount === 50000 ? "default" : "outline"}
                      className={selectedAmount === 50000 ? "border-2 border-brand-purple" : ""}
                      onClick={() => {
                        setSelectedMethod('paypal');
                        setSelectedAmount(50000);
                      }}
                    >
                      50000 points = 5€
                    </Button>
                  </div>
                  
                  {!isWithdrawalPossible && (
                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md text-sm text-yellow-800">
                      Vous avez besoin d'au moins {minWithdrawalPoints} points ({pointsToEuros(minWithdrawalPoints)}€) pour effectuer un retrait.
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email PayPal</label>
                    <Input 
                      placeholder="votre-email@exemple.com" 
                      value={paymentEmail}
                      onChange={(e) => setPaymentEmail(e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleRedeem} 
                    className="w-full bg-gradient-to-br from-brand-purple to-brand-purple/80"
                    disabled={!isWithdrawalPossible || !selectedAmount || !paymentEmail || isRedeeming}
                  >
                    {isRedeeming ? 'Traitement...' : 'Valider le retrait'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="orange_money" className="space-y-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Retrait Orange Money</CardTitle>
                <CardDescription>Via Taptap Send - Entrez votre numéro de téléphone</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={selectedAmount === 25000 ? "default" : "outline"}
                      className={selectedAmount === 25000 ? "border-2 border-brand-purple" : ""}
                      onClick={() => {
                        setSelectedMethod('orange_money');
                        setSelectedAmount(25000);
                      }}
                    >
                      25000 points = 2,50€
                    </Button>
                    <Button
                      variant={selectedAmount === 50000 ? "default" : "outline"}
                      className={selectedAmount === 50000 ? "border-2 border-brand-purple" : ""}
                      onClick={() => {
                        setSelectedMethod('orange_money');
                        setSelectedAmount(50000);
                      }}
                    >
                      50000 points = 5€
                    </Button>
                  </div>
                  
                  {!isWithdrawalPossible && (
                    <div className="bg-yellow-50 border border-yellow-200 p-3 rounded-md text-sm text-yellow-800">
                      Vous avez besoin d'au moins {minWithdrawalPoints} points ({pointsToEuros(minWithdrawalPoints)}€) pour effectuer un retrait.
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Numéro de téléphone</label>
                    <Input 
                      placeholder="+123456789" 
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                  
                  <Button 
                    onClick={handleRedeem} 
                    className="w-full bg-gradient-to-br from-brand-purple to-brand-purple/80"
                    disabled={!isWithdrawalPossible || !selectedAmount || !phoneNumber || isRedeeming}
                  >
                    {isRedeeming ? 'Traitement...' : 'Valider le retrait'}
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
                {isLoadingHistory ? (
                  <div className="py-8 text-center">
                    <div className="w-8 h-8 border-4 border-t-brand-purple rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-sm text-gray-500">Chargement de l'historique...</p>
                  </div>
                ) : withdrawals.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="text-sm text-gray-500">Aucun retrait effectué pour le moment</p>
                  </div>
                ) : (
                  withdrawals.map((withdrawal) => {
                    const statusInfo = formatStatus(withdrawal.status);
                    return (
                      <div key={withdrawal.id} className="flex justify-between py-3 border-b last:border-0">
                        <div>
                          <p className="font-medium">{withdrawal.payment_method === 'paypal' ? 'PayPal' : 'Orange Money'}</p>
                          <p className="text-sm text-gray-500">{formatDate(withdrawal.created_at)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{pointsToEuros(withdrawal.amount_points)}€</p>
                          <p className={`text-sm ${statusInfo.color}`}>{statusInfo.text}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Rewards;
