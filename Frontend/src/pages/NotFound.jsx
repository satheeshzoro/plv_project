import { Link } from "react-router-dom";
import { Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import logoImage from "../../assets/logo.png";
import mainImage from "../../assets/main.png";

const NotFound = () => {
  return (
    <div className="app-shell min-h-screen flex items-center justify-center p-4">
      <div className="grid w-full max-w-5xl gap-8 overflow-hidden rounded-[2rem] border border-border bg-card/90 p-6 shadow-soft-lg md:grid-cols-[1fr_0.9fr] md:p-10">
        <div className="flex flex-col justify-center">
          <div className="brand-logo-lockup">
            <span className="brand-logo-mark">
              <img src={logoImage} alt="QuiLive logo" className="h-8 w-8 object-contain" />
            </span>
            <span>
              <span className="block font-serif text-2xl font-semibold text-heading">QuiLive</span>
              <span className="block text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                Academic Hub
              </span>
            </span>
          </div>

          <h1 className="mt-8 font-serif text-8xl font-bold text-heading">404</h1>
          <h2 className="mt-4 font-serif text-3xl font-semibold text-heading">
            Page Not Found
          </h2>
          <p className="mt-4 max-w-md text-muted-foreground">
            The page you are looking for does not exist or has moved. Return to the main publishing workspace to continue.
          </p>

          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Link>
          </Button>
          <Button asChild variant="outline" className="border-border hover:bg-secondary">
            <Link to="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Link>
          </Button>
          </div>
        </div>

        <div className="brand-image-frame flex items-center justify-center p-6">
          <img src={mainImage} alt="QuiLive illustration" className="w-full max-w-md object-contain" />
        </div>
      </div>
    </div>
  );
};

export default NotFound;
