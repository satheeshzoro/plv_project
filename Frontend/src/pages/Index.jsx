import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import SubmissionProcessSection from "@/components/SubmissionProcessSection";
import EditorCarouselSection from "@/components/EditorCarouselSection";
import TrendingArticles from "@/components/TrendingArticles";
import SubjectCarousel from "@/components/SubjectCarousel";
import IndexedInSection from "@/components/IndexedInSection";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { useAppData } from "@/context/AppDataContext";

const Index = () => {
  const navigate = useNavigate();
  const {
    currentUser,
    currentEditor,
    currentReviewer,
    isAdminLoggedIn,
    logoutUser,
    logoutEditor,
    logoutReviewer,
    logoutAdmin,
  } = useAppData();
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
    const normalizedRole = user?.role?.toUpperCase();

    if (normalizedRole === "ADMIN") {
      navigate("/admin/dashboard", { replace: true });
      return;
    }

    if (normalizedRole === "EDITOR") {
      navigate("/editor/dashboard", { replace: true });
      return;
    }

    if (normalizedRole === "REVIEWER") {
      navigate("/reviewer/dashboard", { replace: true });
      return;
    }

    navigate("/user/dashboard", { replace: true });
  };

  if (isAdminLoggedIn) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (currentEditor) {
    return <Navigate to="/editor/dashboard" replace />;
  }

  if (currentReviewer) {
    return <Navigate to="/reviewer/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        isLoggedIn={!!currentUser}
        user={currentUser}
        onSignIn={() => openAuthModal("signin")} 
        onSignUp={() => openAuthModal("signup")}
        onSignOut={() => {
          if (isAdminLoggedIn) {
            logoutAdmin();
            return;
          }

          if (currentEditor) {
            logoutEditor();
            return;
          }

          if (currentReviewer) {
            logoutReviewer();
            return;
          }

          logoutUser();
        }}
        submitPath="/publish"
      />
      
      <main>
        <HeroSection submitPath="/publish" />
        <SubmissionProcessSection />
        <EditorCarouselSection />
        <TrendingArticles />
        <SubjectCarousel />
        <IndexedInSection />
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
