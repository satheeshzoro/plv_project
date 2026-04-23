import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Award, BadgeCheck, BookOpen, Eye, PlayCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import { resolveBackendUrl } from "@/lib/api";
import doctorHero from "../../assets/main.png";
import "./HeroSection.css";

const STATS = [
  { icon: BookOpen, value: "12,000+", label: "Articles Published" },
  { icon: Users, value: "50,000+", label: "Active Researchers" },
  { icon: Award, value: "500+", label: "Partner Institutions" },
];

const BACKEND_URL = resolveBackendUrl();

const HeroSection = ({ submitPath = "/publish" }) => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [viewerCount, setViewerCount] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const updateVisitorCount = async () => {
      try {
        const response = await fetch(`${BACKEND_URL}/api/site-visitors/`, {
          method: "POST",
          credentials: "include",
        });
        if (!response.ok) {
          throw new Error("Failed to increment visitor count");
        }
        const data = await response.json();
        if (isMounted) {
          setViewerCount(data.count ?? null);
        }
      } catch (error) {
        console.error("Failed to update visitor count:", error);
      }
    };

    updateVisitorCount();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className={`hero-shell ${isDark ? "hero-shell-dark" : ""}`}>
      <div className="container py-12 md:py-16 lg:py-20">
        <div className={`hero-card ${isDark ? "hero-card-dark" : ""}`}>
          <div className={`hero-visitor-pill ${isDark ? "hero-visitor-pill-dark" : ""}`}>
            <Eye className="h-4 w-4" />
            <span className="hero-visitor-label">Viewers</span>
            <span className="hero-visitor-value">
              {viewerCount === null ? "..." : viewerCount.toLocaleString()}
            </span>
          </div>

          <div className="hero-copy">
            <div className={`hero-kicker ${isDark ? "hero-kicker-dark" : ""}`}>
              <span className="hero-kicker-dot" />
              Trusted academic publishing support
            </div>

            <h1 className="hero-title">
              Research publishing that helps your work stay visible
            </h1>

            <p className="hero-description">
              Open-access journals for clinical sciences, biotechnology, pharmacy, nutrition, and interdisciplinary research with streamlined submission and editorial guidance.
            </p>

            <div className="hero-chip-row">
              <span className="hero-chip">
                <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                Peer-Reviewed
              </span>
              <span className="hero-chip">
                <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                Open Access
              </span>
              <span className="hero-chip">
                <BadgeCheck className="h-3.5 w-3.5 text-primary" />
                Journal-Specific
              </span>
            </div>

            <div className={`hero-cta-bar ${isDark ? "hero-cta-bar-dark" : ""}`}>
              <div className="hero-cta-copy">
                <span className="hero-cta-label">Start your manuscript journey</span>
              </div>
              <Button
                size="lg"
                onClick={() => navigate(submitPath)}
                className="hero-primary-button"
              >
                Submit Research
              </Button>
            </div>

            <div className="hero-secondary-actions">
              <Button
                size="lg"
                onClick={() => navigate("/journals")}
                className="group bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Explore Journals
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => navigate("/articles")}
              >
                Read Articles
                <PlayCircle className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-visual-orbit hero-visual-orbit-top" />
            <div className="hero-visual-orbit hero-visual-orbit-mid" />
            <div className="hero-visual-orbit hero-visual-orbit-low" />
            <div className="hero-avatar hero-avatar-one" />
            <div className="hero-avatar hero-avatar-two" />
            <div className="hero-avatar hero-avatar-three" />
            <img src={doctorHero} alt="Academic publishing support" className="hero-image" />
          </div>
        </div>

        <div className={`hero-stats ${isDark ? "hero-stats-dark" : ""}`}>
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="hero-stat-card">
              <div className="hero-stat-icon">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="hero-stat-value">{value}</div>
                <div className="hero-stat-label">{label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
