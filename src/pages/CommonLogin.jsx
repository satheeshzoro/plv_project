import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAppData } from "@/context/AppDataContext";
import { extractApiError, normalizeEmail, resolveBackendUrl } from "@/lib/api";
import logoImage from "../../assets/logo.png";
import mainImage from "../../assets/main.png";

const BACKEND_URL = resolveBackendUrl();

const COMMON_CREDENTIALS = [
  {
    role: "Admin",
    email: "admin@quilivepublishers.com",
    password: "Admin@12345",
  },
  {
    role: "Editor",
    email: "editor@quilivepublishers.com",
    password: "Editor@12345",
  },
];

const getRedirectPath = (role) => {
  const normalizedRole = role?.toUpperCase();
  if (normalizedRole === "ADMIN") return "/admin/dashboard";
  if (normalizedRole === "EDITOR") return "/editor/dashboard";
  return "/user/dashboard";
};

const CommonLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { 
    checkAuth, 
    isAuthChecking, 
    isAdminLoggedIn, 
    currentEditor, 
    currentUser,
    loginAdmin,
    loginEditor,
    loginUser 
  } = useAppData();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (isAuthChecking) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (isAdminLoggedIn) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (currentEditor) {
    return <Navigate to="/editor/dashboard" replace />;
  }

  if (currentUser) {
    return <Navigate to="/user/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const normalizedEmail = normalizeEmail(email);
      if (!normalizedEmail || !password) {
        throw new Error("Email and password are required.");
      }

      const csrfResponse = await fetch(`${BACKEND_URL}/api/csrf/`, {
        credentials: "include",
      });
      if (!csrfResponse.ok) {
        throw new Error("Unable to reach the authentication service. Please try again.");
      }
      const csrfData = await csrfResponse.json();
      const csrfToken = csrfData.csrfToken;

      if (csrfToken) {
        localStorage.setItem("csrfToken", csrfToken);
      }

      const response = await fetch(`${BACKEND_URL}/api/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken || "",
        },
        body: JSON.stringify({ email: normalizedEmail, password }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(extractApiError(errorData, "Invalid credentials"));
      }

      const data = await response.json();

      try {
        const refreshCsrf = await fetch(`${BACKEND_URL}/api/csrf/`, {
          credentials: "include",
        });
        if (refreshCsrf.ok) {
          const refreshData = await refreshCsrf.json();
          if (refreshData.csrfToken) {
            localStorage.setItem("csrfToken", refreshData.csrfToken);
          }
        }
      } catch (refreshError) {
        console.error("Failed to refresh CSRF token after login", refreshError);
      }

      // Update global state immediately using the login response
      // This prevents the "bounce" if the subsequent checkAuth() fails/delays
      const normalizedRole = data.role?.toUpperCase();
      if (normalizedRole === "ADMIN") {
        loginAdmin({ name: data.full_name, email: data.email, role: data.role });
      } else if (normalizedRole === "EDITOR") {
        loginEditor({
          id: data.id,
          name: data.full_name,
          email: data.email,
          role: data.role,
          profile_image: data.profile_image || null,
          requires_profile_image: Boolean(data.requires_profile_image),
          mapped_journal_category: data.mapped_journal_category || "",
        });
      } else {
        loginUser({ id: data.id, username: data.full_name, email: data.email, role: data.role });
      }

      toast({
        title: `Welcome, ${data.full_name || data.email}!`,
        description: `${normalizedRole === "ADMIN" ? "Admin" : normalizedRole === "EDITOR" ? "Editor" : "User"} access granted.`,
      });

      const fromPath = location.state?.from?.pathname;
      const nextPath =
        fromPath && fromPath !== "/login" && fromPath !== "/"
          ? fromPath
          : getRedirectPath(data.role);

      navigate(nextPath, { replace: true });
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error.message || "Unable to sign in.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-shell min-h-screen px-4 py-8 md:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-6xl overflow-hidden rounded-[2rem] border border-border bg-card/80 shadow-soft-lg lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative hidden overflow-hidden bg-[linear-gradient(180deg,rgba(16,53,59,0.96),rgba(27,82,84,0.88))] lg:block">
          <div className="absolute inset-0 brand-subtle-grid opacity-20" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(206,166,88,0.3),transparent_34%)]" />
          <div className="relative flex h-full flex-col justify-between p-10 text-white">
            <div>
              <a href="/" className="brand-logo-lockup">
                <span className="brand-logo-mark border-white/20 bg-white/95">
                  <img src={logoImage} alt="QuiLive logo" className="h-8 w-8 object-contain" />
                </span>
                <span>
                  <span className="block font-serif text-2xl font-semibold">QuiLive</span>
                  <span className="block text-xs uppercase tracking-[0.28em] text-white/70">
                    Academic Hub
                  </span>
                </span>
              </a>
            </div>

            <div className="max-w-xl">
              <span className="brand-badge border-white/20 bg-white/10 text-white">
                Unified Sign In
              </span>
              <h1 className="mt-5 font-serif text-5xl font-semibold leading-tight">
                One portal for admin, editor, and author workflows.
              </h1>
              <p className="mt-4 max-w-lg text-base leading-7 text-white/78">
                Sign in once. The application routes each account directly to the correct workspace based on role and active permissions.
              </p>
            </div>

            <div className="brand-image-frame border-white/10 bg-white/10 p-4">
              <img src={mainImage} alt="QuiLive editorial workspace" className="w-full object-contain" />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center bg-background/85 p-6 md:p-10">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <a href="/" className="brand-logo-lockup inline-flex">
                <span className="brand-logo-mark">
                  <img src={logoImage} alt="QuiLive logo" className="h-8 w-8 object-contain" />
                </span>
                <span>
                  <span className="block font-serif text-2xl font-semibold text-heading">QuiLive</span>
                  <span className="block text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                    Academic Hub
                  </span>
                </span>
              </a>
              <h2 className="mt-8 font-serif text-3xl font-bold text-heading">
                Account Login
              </h2>
              <p className="mt-2 text-muted-foreground">
                Use the common sign-in page. Redirects are handled automatically for admin, editor, and user roles.
              </p>
            </div>

            <div className="brand-panel rounded-[1.5rem] p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your account email"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full rounded-full" disabled={isLoading}>
              {isLoading ? (
                "Signing in..."
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
              </form>

              <div className="mt-6 rounded-2xl bg-secondary/55 p-4">
                <p className="text-sm font-medium text-foreground mb-2">Available seeded accounts</p>
                {COMMON_CREDENTIALS.map((account) => (
                  <p key={account.role} className="text-sm text-muted-foreground">
                    {account.role}: {account.email} / {account.password}
                  </p>
                ))}
              </div>
            </div>

            <div className="mt-6 lg:hidden">
              <div className="brand-image-frame p-4">
                <img src={mainImage} alt="QuiLive editorial workspace" className="w-full object-contain" />
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-6">
              <a href="/" className="hover:text-primary transition-smooth">
                {"<- Back to Home"}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommonLogin;
