import { useState } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import TrendingArticles from "@/components/TrendingArticles";
import SubjectCarousel from "@/components/SubjectCarousel";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { useAppData } from "@/context/AppDataContext";

const Index = () => {
  const { currentUser, loginUser, logoutUser } = useAppData();
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: "signin" });

  const openAuthModal = (mode) => {
    setAuthModal({ isOpen: true, mode });
  };

  const closeAuthModal = () => {
    setAuthModal({ isOpen: false, mode: authModal.mode });
  };

  const switchAuthMode = () => {
    setAuthModal((prev) => ({
      ...prev,
      mode: prev.mode === "signin" ? "signup" : "signin",
    }));
  };

  const handleAuthSuccess = (user) => {
    loginUser(user);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        isLoggedIn={!!currentUser}
        user={currentUser}
        onSignIn={() => openAuthModal("signin")} 
        onSignUp={() => openAuthModal("signup")}
        onSignOut={logoutUser}
      />
      
      <main>
        <HeroSection />
        <TrendingArticles />
        <SubjectCarousel />
      </main>
      
      <Footer />

      <AuthModal
        isOpen={authModal.isOpen}
        onClose={closeAuthModal}
        mode={authModal.mode}
        onSwitchMode={switchAuthMode}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default Index;
