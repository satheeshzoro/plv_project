import { useState } from "react";
import { X, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAppData } from "@/context/AppDataContext";
import { extractApiError, normalizeEmail, normalizeText, resolveBackendUrl } from "@/lib/api";
import logoImage from "../../assets/logo.png";
import mainImage from "../../assets/main.png";

const AuthModal = ({ isOpen, onClose, mode, onSwitchMode, onSuccess }) => {
  const { toast } = useToast();
  const { loginAdmin, loginEditor, loginUser } = useAppData();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  if (!isOpen) return null;

  const isSignUp = mode === "signup";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const backendUrl = resolveBackendUrl();
      const payload = {
        name: normalizeText(formData.name),
        email: normalizeEmail(formData.email),
        password: formData.password,
      };

      if (!payload.email || !payload.password || (isSignUp && !payload.name)) {
        throw new Error("Please fill in all required fields.");
      }
      
      // 1. Fetch CSRF Token FIRST
      const csrfResponse = await fetch(`${backendUrl}/api/csrf/`, { credentials: "include" });
      if (!csrfResponse.ok) {
        throw new Error("Unable to reach the authentication service. Please try again.");
      }
      const csrfData = await csrfResponse.json();
      const csrfToken = csrfData.csrfToken;
      
      if (csrfToken) {
        localStorage.setItem("csrfToken", csrfToken);
      }

      if (isSignUp) {
        const response = await fetch(`${backendUrl}/api/register/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken || "",
          },
          body: JSON.stringify({
            email: payload.email,
            full_name: payload.name,
            password: payload.password,
          }),
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(extractApiError(errorData, "Registration failed"));
        }

        toast({
          title: "Account Created!",
          description: "Your account has been created successfully. Please sign in.",
        });
        
        onSwitchMode();
      } else {
        // Real Login Logic
        const response = await fetch(`${backendUrl}/api/login/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": csrfToken || "",
          },
          body: JSON.stringify({
            email: payload.email,
            password: payload.password,
            portal: "GENERAL",
          }),
          credentials: "include",
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(extractApiError(errorData, "Login failed. Please check your credentials."));
        }

        const data = await response.json();

        // REFRESH CSRF TOKEN: Session ID changed after login, so we need the new token
        try {
          const refreshCsrf = await fetch(`${backendUrl}/api/csrf/`, { credentials: "include" });
          if (refreshCsrf.ok) {
            const refreshData = await refreshCsrf.json();
            if (refreshData.csrfToken) {
              localStorage.setItem("csrfToken", refreshData.csrfToken);
            }
          }
        } catch (e) {
          console.error("Failed to refresh CSRF token after login", e);
        }

        const sessionProbe = await fetch(`${backendUrl}/api/user/me/`, {
          method: "GET",
          credentials: "include",
        });

        if (!sessionProbe.ok) {
          throw new Error(
            "Your login session is not active on this host. Please sign in again and ensure frontend/backend use the same host (localhost with localhost, 127.0.0.1 with 127.0.0.1, or the same 192.168.x.x host)."
          );
        }

        const verifiedSession = await sessionProbe.json();

        const normalizedRole = verifiedSession.role?.toUpperCase() || data.role?.toUpperCase();
        const userData = {
          ...data,
          ...verifiedSession,
          role: verifiedSession.role || normalizedRole || data.role,
          username:
            verifiedSession.full_name ||
            data.full_name ||
            data.name ||
            data.username ||
            payload.email.split("@")[0],
        };

        if (normalizedRole === "ADMIN") {
          loginAdmin({
            name: verifiedSession.full_name || data.full_name || userData.username,
            email: verifiedSession.email || data.email,
            role: verifiedSession.role || data.role,
          });
        } else if (normalizedRole === "EDITOR" || normalizedRole === "REVIEWER") {
          loginEditor({
            id: verifiedSession.id || data.id,
            name: verifiedSession.full_name || data.full_name || userData.username,
            email: verifiedSession.email || data.email,
            role: verifiedSession.role || data.role,
            profile_image: verifiedSession.profile_image || data.profile_image || null,
            requires_profile_image: Boolean(
              verifiedSession.requires_profile_image ?? data.requires_profile_image
            ),
            mapped_journal_category:
              verifiedSession.mapped_journal_category || data.mapped_journal_category || "",
          });
        } else {
          loginUser({
            id: verifiedSession.id || data.id,
            username: userData.username,
            email: verifiedSession.email || data.email,
            role: verifiedSession.role || data.role,
          });
        }

        toast({
          title: "Welcome Back!",
          description: "You have been signed in successfully.",
        });

        onSuccess(userData);
        onClose();
      }
    } catch (error) {
      console.error("Authentication error:", error);
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-4xl overflow-hidden rounded-[2rem] border border-border/50 bg-card shadow-soft-lg animate-slide-up md:grid md:grid-cols-[0.95fr_1.05fr]">
        <div className="relative hidden overflow-hidden bg-[linear-gradient(180deg,rgba(17,55,59,0.98),rgba(32,96,97,0.88))] p-8 text-white md:flex md:flex-col md:justify-between">
          <div className="absolute inset-0 brand-subtle-grid opacity-20" />
          <div className="relative">
            <div className="brand-logo-lockup">
              <span className="brand-logo-mark border-white/15 bg-white/95">
                <img src={logoImage} alt="QuiLive logo" className="h-8 w-8 object-contain" />
              </span>
              <span>
                <span className="block font-serif text-2xl font-semibold">QuiLive</span>
                <span className="block text-[11px] uppercase tracking-[0.28em] text-white/70">
                  Publisher's
                </span>
              </span>
            </div>
            <h3 className="mt-10 font-serif text-4xl font-semibold leading-tight">
              {isSignUp ? "Create your author account and start publishing." : "Continue into your role-based workspace."}
            </h3>
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/76">
              This sign in is for author accounts. Editor/reviewer/admin accounts should use their dedicated login pages.
            </p>
          </div>

          <div className="brand-image-frame border-white/10 bg-white/10 p-4">
            <img src={mainImage} alt="QuiLive workspace illustration" className="w-full object-contain" />
          </div>
        </div>

        <div className="relative p-6 md:p-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-smooth"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <span className="brand-logo-lockup justify-center">
            <span className="brand-logo-mark">
              <img src={logoImage} alt="QuiLive logo" className="h-8 w-8 object-contain" />
            </span>
          </span>
          <h2 className="font-serif text-2xl font-bold text-heading mt-4 mb-2">
            {isSignUp ? "Create Your Account" : "Welcome Back"}
          </h2>
          <p className="text-muted-foreground text-sm">
            {isSignUp
              ? "Join our community of researchers and scholars"
              : "Sign in to continue to QuiLive"}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-foreground">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  className="pl-10 bg-background border-border"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-foreground">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="pl-10 bg-background border-border"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-foreground">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={isSignUp ? "Create a password" : "Enter your password"}
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                className="pl-10 pr-10 bg-background border-border"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-smooth"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {!isSignUp && (
            <div className="text-right">
              <a href="#" className="text-sm text-primary hover:text-accent transition-smooth">
                Forgot password?
              </a>
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {isSignUp ? "Creating Account..." : "Signing In..."}
              </span>
            ) : (
              isSignUp ? "Create Account" : "Sign In"
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-card text-muted-foreground">or</span>
          </div>
        </div>

        {/* Switch Mode */}
        <p className="text-center text-sm text-muted-foreground">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={onSwitchMode}
            className="font-medium text-primary hover:text-accent transition-smooth"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
