import { useNavigate } from "react-router-dom";
import { ArrowRight, BookOpen, Users, Award, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import "./HeroSection.css";

const STATS = [
  { icon: BookOpen, value: "12,000+", label: "Articles Published" },
  { icon: Users, value: "50,000+", label: "Active Researchers" },
  { icon: Award, value: "500+", label: "Partner Institutions" },
];

const HeroSection = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  if (isDark) {
    return (
      <section className="hero-dark-shell">
        <div className="container py-16 md:py-24 lg:py-28">
          <div className="hero-dark-content hero-dark-centered">
            <span className="hero-brand">QUILIVE PUBLISHERS</span>
            <h1>
              Future-Ready
              <br />
              <span>Academic Publishing</span>
            </h1>
            <p>
              A futuristic open-access publishing experience where impactful research meets premium digital presence.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row sm:flex-wrap items-center justify-center gap-3">
              <Button
                size="lg"
                onClick={() => navigate("/submit-manuscript")}
                className="min-w-[220px] bg-white text-black hover:bg-white/90"
              >
                Submit Manuscript
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/journals")}
                className="min-w-[220px] border-white/40 text-white hover:bg-white/10"
              >
                Explore Journals
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative gradient-hero overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <div className="container relative py-16 md:py-24 lg:py-32">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-medium bg-secondary text-secondary-foreground rounded-full animate-fade-in">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            Trusted by leading universities worldwide
          </div>

          {/* Headline */}
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl font-bold text-heading leading-tight mb-6 animate-slide-up">
            Publish With{" "}
            <span className="text-primary">QuiLive Journals</span>
          </h1>

          {/* Sub-headline */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up animation-delay-100">
            Open-access journals for medicine, biotechnology, pharmacy, nutrition, and interdisciplinary clinical research.
            Build visibility with rigorous peer review and global readership.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 mb-10 animate-slide-up animation-delay-150">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-card border border-border px-3 py-1 text-xs text-foreground">
              <BadgeCheck className="w-3.5 h-3.5 text-primary" />
              Peer-Reviewed
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-card border border-border px-3 py-1 text-xs text-foreground">
              <BadgeCheck className="w-3.5 h-3.5 text-primary" />
              Open Access
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-card border border-border px-3 py-1 text-xs text-foreground">
              <BadgeCheck className="w-3.5 h-3.5 text-primary" />
              Multi-Disciplinary
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-up animation-delay-200">
            <Button 
              size="lg" 
              onClick={() => navigate("/articles")}
              className="group bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-6 text-lg"
            >
              Start Reading
              <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={() => navigate("/publish")}
              className="px-8 py-6 text-lg border-border hover:bg-secondary hover:text-secondary-foreground"
            >
              Submit Research
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 pt-8 border-t border-border/50 animate-slide-up animation-delay-300">
            {STATS.map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex flex-col items-center gap-2">
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-primary" />
                  <span className="font-serif text-2xl md:text-3xl font-bold text-heading">
                    {value}
                  </span>
                </div>
                <span className="text-sm text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
