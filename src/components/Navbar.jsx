import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Instagram,
  Twitter,
  MessageCircle,
  Linkedin,
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  Moon,
  Sun,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SOCIAL_LINKS = [
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Twitter, href: "https://twitter.com", label: "X (Twitter)" },
  { icon: MessageCircle, href: "https://whatsapp.com", label: "WhatsApp" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
];

const PRIMARY_LINKS = [
  { label: "Home", to: "/" },
  { label: "Journals", to: "/journals" },
  { label: "Submit Manuscript", to: "/submit-manuscript" },
];

const MORE_LINKS = [
  { label: "About Us", to: "/about-us" },
  { label: "Open Access", to: "/open-access" },
];

const GUIDELINE_LINKS = [
  { label: "Guidelines", to: "/guidelines" },
  { label: "Author Guidelines", to: "/author-guidelines" },
  { label: "Processing Fee", to: "/processing-fee" },
  { label: "Manuscript Guidelines", to: "/manuscript-guidelines" },
  { label: "Peer Review Process", to: "/peer-review-process" },
];

const Navbar = ({ isLoggedIn, user, onSignIn, onSignUp, onSignOut }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 surface-elevated border-b border-border/50 backdrop-blur-sm bg-background/95">
      <nav className="container flex items-center justify-between h-16 md:h-18">
        {/* Logo */}
        <a href="/" className="flex items-center gap-1 group">
          <span className="font-serif text-2xl md:text-3xl font-bold text-primary transition-smooth group-hover:text-accent">
            AJ
          </span>
          <span className="hidden sm:inline font-serif text-lg text-muted-foreground ml-2">
            QUILIVE
          </span>
        </a>

        {/* Desktop Navigation - Right Side */}
        <div className="hidden md:flex items-center gap-4">
          {PRIMARY_LINKS.map(({ label, to }) => (
            <Link key={label} to={to} className="text-[13px] font-medium text-muted-foreground hover:text-primary transition-smooth">
              {label}
            </Link>
          ))}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex items-center gap-1 text-[13px] font-medium text-muted-foreground hover:text-primary transition-smooth">
                More
                <ChevronDown className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {MORE_LINKS.map(({ label, to }) => (
                <DropdownMenuItem key={label} asChild>
                  <Link to={to}>{label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex items-center gap-1 text-[13px] font-medium text-muted-foreground hover:text-primary transition-smooth">
                Guidelines
                <ChevronDown className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {GUIDELINE_LINKS.map(({ label, to }) => (
                <DropdownMenuItem key={label} asChild>
                  <Link to={to}>{label}</Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Link to="/contact" className="text-[13px] font-medium text-muted-foreground hover:text-primary transition-smooth">
            Contact
          </Link>

          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="h-9 w-9 rounded-full"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>

          {/* Auth Buttons or User Menu */}
          {isLoggedIn && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 text-foreground hover:text-primary">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-medium">{user.username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onSignOut} className="flex items-center gap-2 text-destructive">
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={onSignIn} className="text-foreground hover:bg-secondary">
                Sign In
              </Button>
              <Button onClick={onSignUp} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                Register
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 text-foreground hover:bg-secondary rounded-lg transition-smooth"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden surface-elevated border-t border-border/50 animate-fade-in">
          <div className="container py-4 space-y-4">
            {/* Navigation Links */}
            <div className="flex flex-col items-center gap-2">
              {PRIMARY_LINKS.map(({ label, to }) => (
                <Link key={label} to={to} className="text-muted-foreground hover:text-primary transition-smooth py-1.5">
                  {label}
                </Link>
              ))}
              <div className="text-xs uppercase text-muted-foreground mt-1">More</div>
              {MORE_LINKS.map(({ label, to }) => (
                <Link key={label} to={to} className="text-sm text-muted-foreground hover:text-primary transition-smooth py-1">
                  {label}
                </Link>
              ))}
              <div className="text-xs uppercase text-muted-foreground mt-1">Guidelines</div>
              {GUIDELINE_LINKS.map(({ label, to }) => (
                <Link key={label} to={to} className="text-sm text-muted-foreground hover:text-primary transition-smooth py-1">
                  {label}
                </Link>
              ))}
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-smooth py-1">
                Contact
              </Link>
              <Button
                variant="outline"
                onClick={toggleTheme}
                className="mt-1"
              >
                {isDark ? "Switch to Light" : "Switch to Dark"}
              </Button>
            </div>

            {/* Social Links */}
            <div className="flex items-center justify-center gap-4">
            {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 text-muted-foreground hover:text-primary transition-smooth rounded-lg hover:bg-secondary"
                  aria-label={label}
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>

            {/* Auth Buttons or User Info */}
            {isLoggedIn && user ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-center gap-2 py-2">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <span className="font-medium text-foreground">{user.username}</span>
                </div>
                <Button variant="ghost" onClick={onSignOut} className="w-full justify-center text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Button variant="ghost" onClick={onSignIn} className="w-full justify-center">
                  Sign In
                </Button>
                <Button onClick={onSignUp} className="w-full justify-center bg-primary text-primary-foreground">
                  Register
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
