
import React from 'react';
import { ChevronRight, HelpCircle, FileQuestion, MessageSquareText, BookOpen, MessagesSquare, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Layout from '@/components/Layout';
import { Link } from 'react-router-dom';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const HelpCenter = () => {
  return (
    <Layout>
      <div className="container max-w-md mx-auto pt-6 pb-20 px-4">
        <h1 className="text-2xl font-bold mb-6">Centre d'Aide</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Comment pouvons-nous vous aider ?</CardTitle>
            <CardDescription>Trouvez rapidement des réponses à vos questions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-24 flex flex-col gap-2 items-center justify-center" asChild>
                <Link to="/help/faq">
                  <FileQuestion className="h-6 w-6 text-brand-purple" />
                  <span>FAQ</span>
                </Link>
              </Button>
              
              <Button variant="outline" className="h-24 flex flex-col gap-2 items-center justify-center" asChild>
                <Link to="/help/contact">
                  <MessageSquareText className="h-6 w-6 text-brand-purple" />
                  <span>Contact</span>
                </Link>
              </Button>
              
              <Button variant="outline" className="h-24 flex flex-col gap-2 items-center justify-center" asChild>
                <Link to="/help/guides">
                  <BookOpen className="h-6 w-6 text-brand-purple" />
                  <span>Guides</span>
                </Link>
              </Button>
              
              <Button variant="outline" className="h-24 flex flex-col gap-2 items-center justify-center" asChild>
                <Link to="/help/community">
                  <MessagesSquare className="h-6 w-6 text-brand-purple" />
                  <span>Communauté</span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Questions fréquentes</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Comment gagner des points ?</AccordionTrigger>
                <AccordionContent>
                  Vous pouvez gagner des points en regardant des publicités, en complétant des sondages et en participant à notre programme de parrainage.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2">
                <AccordionTrigger>Comment échanger mes points ?</AccordionTrigger>
                <AccordionContent>
                  Vous pouvez échanger vos points contre des récompenses dans la section "Récompenses". Nous proposons des cartes cadeaux, des virements PayPal et d'autres options.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3">
                <AccordionTrigger>Quand vais-je recevoir ma récompense ?</AccordionTrigger>
                <AccordionContent>
                  Les récompenses sont généralement traitées dans un délai de 24 à 48 heures après la demande. Vous recevrez une notification lorsque votre récompense sera disponible.
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4">
                <AccordionTrigger>Comment fonctionne le parrainage ?</AccordionTrigger>
                <AccordionContent>
                  Invitez vos amis avec votre code de parrainage unique. Vous recevrez des points bonus lorsqu'ils s'inscriront et compléteront leur première activité.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Contactez-nous</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="ghost" className="w-full justify-between" asChild>
              <Link to="/help/contact/email">
                <div className="flex items-center">
                  <MessageSquareText className="mr-2 h-5 w-5 text-brand-purple" />
                  Envoyer un email
                </div>
                <ChevronRight className="h-5 w-5" />
              </Link>
            </Button>
            
            <Button variant="ghost" className="w-full justify-between" asChild>
              <Link to="/help/contact/chat">
                <div className="flex items-center">
                  <MessagesSquare className="mr-2 h-5 w-5 text-brand-purple" />
                  Chat en direct
                </div>
                <ChevronRight className="h-5 w-5" />
              </Link>
            </Button>
            
            <Button variant="ghost" className="w-full justify-between" asChild>
              <Link to="/help/feedback">
                <div className="flex items-center">
                  <Star className="mr-2 h-5 w-5 text-brand-purple" />
                  Donnez votre avis
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

export default HelpCenter;
