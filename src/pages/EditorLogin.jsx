import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAppData } from "@/context/AppDataContext";

const EditorLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { checkAuth, currentEditor, editors } = useAppData();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  if (currentEditor) {
    navigate("/editor/dashboard");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

      // 1. Fetch CSRF Token FIRST
      const csrfResponse = await fetch(`${backendUrl}/api/csrf/`, { credentials: "include" });
      const csrfData = await csrfResponse.json();
      const csrfToken = csrfData.csrfToken;
      
      if (csrfToken) {
        localStorage.setItem("csrfToken", csrfToken);
      }

      const response = await fetch(`${backendUrl}/api/login/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": csrfToken || "",
        },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await response.json();

      if (data.role !== "EDITOR") {
        throw new Error("Unauthorized: Access restricted to editors.");
      }

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

      // Ensure we have a name to display
      const editorData = { ...data, name: data.full_name || data.name || "Editor", role: data.role };

      await checkAuth(); // Verify session and update state globally

      toast({
        title: "Welcome!",
        description: "You have successfully logged in.",
      });
      navigate("/editor/dashboard");
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <a href="/" className="inline-block mb-6">
            <span className="font-serif text-4xl font-bold text-primary">AJ</span>
          </a>
          <h1 className="font-serif text-2xl font-bold text-heading mb-2">
            Editor Portal
          </h1>
          <p className="text-muted-foreground">
            Sign in to access your editor dashboard
          </p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6 md:p-8">
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
                  placeholder="editor@journal.com"
                  className="pl-10"
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
                  placeholder="Enter any password"
                  className="pl-10"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
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

          <div className="mt-6 p-4 bg-secondary/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Demo Editors:</strong><br />
              {editors.slice(0, 2).map((e) => (
                <span key={e.id} className="block">• {e.email}</span>
              ))}
              <span className="block mt-1">Password: (any)</span>
            </p>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <a href="/" className="hover:text-primary transition-smooth">
            ← Back to Home
          </a>
        </p>
      </div>
    </div>
  );
};

export default EditorLogin;
