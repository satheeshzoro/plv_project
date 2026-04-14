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
        submitPath="/publish"
      />

      <main className="py-12 md:py-16">
        <div className="container">
          <div className="mb-10 rounded-[28px] border border-border bg-card p-8 shadow-soft md:p-10">
            <h1 className="mb-4 font-serif text-3xl font-bold text-heading md:text-4xl lg:text-5xl">
              {title}
            </h1>
            {subtitle ? (
              <p className="max-w-3xl text-lg text-muted-foreground">{subtitle}</p>
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
