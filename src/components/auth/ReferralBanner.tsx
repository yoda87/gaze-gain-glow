
import React from 'react';
import { Gift } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface ReferralBannerProps {
  referralCode: string;
}

const ReferralBanner = ({ referralCode }: ReferralBannerProps) => {
  if (!referralCode) return null;
  
  return (
    <Card className="mb-6 border-brand-purple/20">
      <CardContent className="p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 bg-brand-purple/10 rounded-full flex items-center justify-center mr-4">
            <Gift className="text-brand-purple h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-medium">Vous avez été parrainé(e) !</p>
            <p className="text-xs text-gray-600">Vous recevrez un bonus après votre inscription</p>
            <div className="mt-2 bg-brand-purple/5 rounded-md px-3 py-1.5 border border-brand-purple/10">
              <p className="text-xs font-semibold text-brand-purple">Code utilisé : {referralCode}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ReferralBanner;
