
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { UserProvider } from "./context/UserContext";
import SplashScreen from "./pages/SplashScreen";
import Dashboard from "./pages/Dashboard";
import WatchAd from "./pages/WatchAd";
import Rewards from "./pages/Rewards";
import Referral from "./pages/Referral";
import Profile from "./pages/Profile";
import Settings from "./pages/Settings";
import HelpCenter from "./pages/HelpCenter";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Show splash screen for 3 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/watch-ad" element={<WatchAd />} />
              <Route path="/rewards" element={<Rewards />} />
              <Route path="/referral" element={<Referral />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/help" element={<HelpCenter />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </UserProvider>
    </QueryClientProvider>
  );
};

export default App;
