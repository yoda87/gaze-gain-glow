
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import SignUpForm from '@/components/auth/SignUpForm';
import ReferralBanner from '@/components/auth/ReferralBanner';
import { useAuth } from '@/context/AuthContext';

const SignUp = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referralCode = searchParams.get('ref') || '';
  const { isAuthenticated } = useAuth();

  // Redirect to home if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return (
    <Layout hideNav>
      <div className="container max-w-md mx-auto pt-8 pb-20 px-4">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold mb-2 text-brand-purple">Inscription</h1>
          <p className="text-gray-600">Créez votre compte pour commencer à gagner des récompenses</p>
        </div>

        <ReferralBanner referralCode={referralCode} />
        <SignUpForm initialReferralCode={referralCode} />
      </div>
    </Layout>
  );
};

export default SignUp;
