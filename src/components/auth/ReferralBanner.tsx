
import React from 'react';
import { Gift } from 'lucide-react';

interface ReferralBannerProps {
  referralCode: string;
}

const ReferralBanner = ({ referralCode }: ReferralBannerProps) => {
  if (!referralCode) return null;
  
  return (
    <div className="mb-6 bg-brand-purple/10 p-4 rounded-lg flex items-center">
      <Gift className="text-brand-purple mr-3 h-5 w-5" />
      <div>
        <p className="text-sm font-medium">Vous avez été parrainé(e) !</p>
        <p className="text-xs text-gray-600">Vous recevrez un bonus après votre inscription</p>
      </div>
    </div>
  );
};

export default ReferralBanner;
