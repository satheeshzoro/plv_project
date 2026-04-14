import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/context/ThemeContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAppData } from "@/context/AppDataContext";
import logoImage from "../../assets/logo.png";

const SOCIAL_LINKS = [
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Twitter, href: "https://twitter.com", label: "X (Twitter)" },
  { icon: MessageCircle, href: "https://whatsapp.com", label: "WhatsApp" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
];

const PRIMARY_LINKS = [
  { label: "Home", to: "/" },
  { label: "Journals", to: "/journals" },
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

const getAccountPath = (user) => {
  const role = user?.role?.toUpperCase();
  if (role === "ADMIN") return "/admin/dashboard";
  if (role === "EDITOR") return "/editor/dashboard";
  return "/user/dashboard";
};

const getAccountLabel = (user) => {
  const role = user?.role?.toUpperCase();
  if (role === "ADMIN") return "Admin Dashboard";
  if (role === "EDITOR") return "Editor Dashboard";
  return "Submission History";
};

const Navbar = ({ isLoggedIn, user, onSignIn, onSignUp, onSignOut, submitPath = "/publish" }) => {
  const { toast } = useToast();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: "",
    email: "",
    whatsapp: "",
    pen_name: "",
    country: "",
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState("");
  const [isUploadingProfileImage, setIsUploadingProfileImage] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const { profileSummary, fetchProfileSummary, updateProfileSummary, uploadEditorProfileImage } = useAppData();
  const normalizedRole = user?.role?.toUpperCase();
  const isEditorRole = normalizedRole === "EDITOR";
  const accountPath = getAccountPath(user);
  const accountLabel = getAccountLabel(user);
  const activeLinkClass = "text-[13px] font-semibold text-primary";
  const baseLinkClass = "text-[13px] font-medium text-muted-foreground hover:text-primary transition-smooth";
  const isPathActive = (to) => location.pathname === to;
  const getImageDimensions = (file) =>
    new Promise((resolve, reject) => {
      const img = new window.Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
        URL.revokeObjectURL(objectUrl);
      };
      img.onerror = () => {
        reject(new Error("Invalid image file."));
        URL.revokeObjectURL(objectUrl);
      };
      img.src = objectUrl;
    });

  const openProfile = async () => {
    if (isLoggedIn && user) {
      const data = await fetchProfileSummary().catch(() => null);
      if (data) {
        setProfileForm({
          full_name: data.full_name || "",
          email: data.email || "",
          whatsapp: data.whatsapp || "",
          pen_name: data.pen_name || "",
          country: data.country || "",
        });
        setProfileImagePreview(data.profile_image || "");
        setProfileImageFile(null);
      }
      setIsProfileOpen(true);
    }
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      if (isEditorRole && profileImageFile) {
        if (profileImageFile.size > 1.5 * 1024 * 1024) {
          throw new Error("Image size must be at most 1.5 MB.");
        }
        const { width, height } = await getImageDimensions(profileImageFile);
        if (width < 64 || height < 64 || width > 500 || height > 500) {
          throw new Error("Editor image must be between 64 x 64 and 500 x 500 pixels.");
        }

        setIsUploadingProfileImage(true);
        const uploadResult = await uploadEditorProfileImage(profileImageFile);
        setProfileImagePreview(uploadResult.profile_image || "");
        setProfileImageFile(null);
      }
      await updateProfileSummary(profileForm);
      setIsProfileOpen(false);
    } catch (error) {
      console.error("Failed to update profile", error);
      toast({
        title: "Profile update failed",
        description: error.message || "Unable to update profile right now.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingProfileImage(false);
      setIsSavingProfile(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 surface-elevated border-b border-border/50 backdrop-blur-sm bg-background/95">
      <nav className="container flex items-center justify-between h-16 md:h-18">
        {/* Logo */}
        <a href="/" className="flex items-center gap-3 group">
          <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
            <img src={logoImage} alt="QuiLive logo" className="h-8 w-8 object-contain" />
          </span>
          <span className="hidden sm:flex flex-col leading-none">
            <span className="font-serif text-lg font-semibold text-heading transition-smooth group-hover:text-primary">
              QuiLive
            </span>
            <span className="mt-1 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">
              Academic Hub
            </span>
          </span>
        </a>

        {/* Desktop Navigation - Right Side */}
        <div className="hidden md:flex items-center gap-4">
          {PRIMARY_LINKS.map(({ label, to }) => (
            <Link key={label} to={to} className={isPathActive(to) ? activeLinkClass : baseLinkClass}>
              {label}
            </Link>
          ))}
          <Link to={submitPath} className={isPathActive(submitPath) ? activeLinkClass : baseLinkClass}>
            Submit Manuscript
          </Link>

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

          <Link to="/contact" className={isPathActive("/contact") ? activeLinkClass : baseLinkClass}>
            Contact
          </Link>

          {isLoggedIn && user ? (
            <Link to={accountPath} className={isPathActive(accountPath) ? activeLinkClass : baseLinkClass}>
              {accountLabel}
            </Link>
          ) : null}

          {isLoggedIn && user ? (
            <Link to="/users" className={isPathActive("/users") ? activeLinkClass : baseLinkClass}>
              Users
            </Link>
          ) : null}

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
                  <span className="font-medium">{user.username || user.name || user.email}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="flex items-center gap-2" onClick={openProfile}>
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="flex items-center gap-2">
                  <Link to={accountPath}>
                    <User className="w-4 h-4" />
                    <span>{accountLabel}</span>
                  </Link>
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
              <Link to={submitPath} className="text-muted-foreground hover:text-primary transition-smooth py-1.5">
                Submit Manuscript
              </Link>
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
              {isLoggedIn && user ? (
                <Link to={accountPath} className="text-sm text-muted-foreground hover:text-primary transition-smooth py-1">
                  {accountLabel}
                </Link>
              ) : null}
              {isLoggedIn && user ? (
                <Link to="/users" className="text-sm text-muted-foreground hover:text-primary transition-smooth py-1">
                  Users
                </Link>
              ) : null}
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
                  <span className="font-medium text-foreground">{user.username || user.name || user.email}</span>
                </div>
                <Button asChild variant="ghost" className="w-full justify-center">
                  <Link to={accountPath}>{accountLabel}</Link>
                </Button>
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

      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 text-sm">
            <div className="grid gap-2">
              <Label htmlFor="profile-name">Name</Label>
              <Input
                id="profile-name"
                value={profileForm.full_name}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, full_name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profile-email">Email</Label>
              <Input
                id="profile-email"
                type="email"
                value={profileForm.email}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profile-phone">Phone</Label>
              <Input
                id="profile-phone"
                value={profileForm.whatsapp}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, whatsapp: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profile-pen-name">Pen Name</Label>
              <Input
                id="profile-pen-name"
                value={profileForm.pen_name}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, pen_name: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="profile-country">Country</Label>
              <Input
                id="profile-country"
                value={profileForm.country}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, country: e.target.value }))}
              />
            </div>
            {isEditorRole ? (
              <div className="grid gap-2">
                <Label htmlFor="profile-image">Editor Image (64 x 64 to 500 x 500, max 1.5 MB)</Label>
                {profileImagePreview ? (
                  <img
                    src={profileImagePreview}
                    alt="Editor profile"
                    className="h-16 w-16 rounded-full border border-border object-cover"
                  />
                ) : null}
                <Input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setProfileImageFile(file);
                    if (file) {
                      const objectUrl = URL.createObjectURL(file);
                      setProfileImagePreview(objectUrl);
                    }
                  }}
                />
              </div>
            ) : null}
            <div className="grid grid-cols-2 gap-3 rounded-md border border-border p-3">
              <div><span className="font-medium">Total Submissions:</span> {profileSummary?.total_submissions ?? 0}</div>
              <div><span className="font-medium">Published:</span> {profileSummary?.published_submissions ?? 0}</div>
            </div>
            <Button onClick={handleSaveProfile} disabled={isSavingProfile || isUploadingProfileImage} className="w-full">
              {isSavingProfile || isUploadingProfileImage ? "Saving..." : "Save Profile"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Navbar;
