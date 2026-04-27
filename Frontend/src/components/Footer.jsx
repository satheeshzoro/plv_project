import { Instagram, Twitter, MessageCircle, Linkedin, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import logoImage from "../../assets/logo.png";

const FOOTER_LINKS = {
  Explore: [
    { label: "Articles", to: "/articles" },
    { label: "Journals", to: "/journals" },
    { label: "Authors", to: "/users" },
    { label: "Categories", to: "/guidelines" },
  ],
  Resources: [
    { label: "Submit Research", to: "/publish" },
    { label: "Peer Review", to: "/peer-review-process" },
    { label: "Author Guidelines", to: "/author-guidelines" },
    { label: "API Access", to: "/contact" },
  ],
  Company: [
    { label: "About Us", to: "/about-us" },
    { label: "Careers", to: "/contact" },
    { label: "Contact", to: "/contact" },
    { label: "Press", to: "/open-access" },
  ],
  Legal: [
    { label: "Privacy Policy", to: "/open-access" },
    { label: "Terms of Service", to: "/guidelines" },
    { label: "Cookie Policy", to: "/processing-fee" },
    { label: "Accessibility", to: "/manuscript-guidelines" },
  ],
};

const SOCIAL_LINKS = [
  { icon: Instagram, href: "https://instagram.com", label: "Instagram" },
  { icon: Twitter, href: "https://twitter.com", label: "X (Twitter)" },
  { icon: MessageCircle, href: "https://whatsapp.com", label: "WhatsApp" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-6 md:gap-12">
          <div className="col-span-2">
            <Link to="/" className="brand-logo-lockup mb-4 inline-flex">
              <span className="brand-logo-mark">
                <img src={logoImage} alt="QuiLive logo" className="h-8 w-8 object-contain" />
              </span>
              <span>
                <span className="block font-serif text-2xl font-semibold text-heading">QuiLive</span>
                <span className="block text-[11px] uppercase tracking-[0.28em] text-muted-foreground">
                  Publisher's
                </span>
              </span>
            </Link>
            <p className="mb-6 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Open-access publishing with one connected experience for authors, editors, and administrators.
            </p>

            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">Stay Updated</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-4 text-sm transition-smooth focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <button className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-smooth hover:bg-primary/90">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h4 className="mb-4 font-medium text-foreground">{title}</h4>
              <ul className="space-y-3">
                {links.map(({ label, to }) => (
                  <li key={label}>
                    <Link to={to} className="text-sm text-muted-foreground transition-smooth hover:text-primary">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
          <p className="text-center text-sm text-muted-foreground sm:text-left">
            Copyright {currentYear} QuiLive. All rights reserved.
          </p>

          <div className="flex items-center gap-1">
            {SOCIAL_LINKS.map(({ icon: Icon, href, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-2 text-muted-foreground transition-smooth hover:bg-secondary hover:text-primary"
                aria-label={label}
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
