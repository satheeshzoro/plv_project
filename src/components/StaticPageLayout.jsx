import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAppData } from "@/context/AppDataContext";

const StaticPageLayout = ({ title, subtitle, children }) => {
  const navigate = useNavigate();
  const { currentUser, logoutUser } = useAppData();

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        isLoggedIn={!!currentUser}
        user={currentUser}
        onSignIn={() => navigate("/")}
        onSignUp={() => navigate("/")}
        onSignOut={() => {
          logoutUser();
          navigate("/");
        }}
      />

      <main className="py-12 md:py-16">
        <div className="container">
          <div className="mb-10">
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-heading mb-4">
              {title}
            </h1>
            {subtitle ? (
              <p className="text-muted-foreground text-lg max-w-3xl">{subtitle}</p>
            ) : null}
          </div>
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StaticPageLayout;