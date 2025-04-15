
import React, { useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If not loading and not authenticated, redirect to login
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-pulse text-center">
          <div className="h-10 w-10 mx-auto mb-4 rounded-full bg-brand-purple/30"></div>
          <p className="text-gray-600">Chargement de votre session...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : null; // Return null to avoid flicker while redirecting
};

export default ProtectedRoute;
