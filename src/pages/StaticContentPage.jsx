import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { ArrowRight, BadgeCheck } from "lucide-react";
import StaticPageLayout from "@/components/StaticPageLayout";
import { Button } from "@/components/ui/button";
import { STATIC_PAGES } from "@/data/staticPages";

const PAGE_BY_PATH = {
  "/about-us": STATIC_PAGES.aboutUs,
  "/open-access": STATIC_PAGES.openAccess,
  "/guidelines": STATIC_PAGES.editorGuidelines,
  "/author-guidelines": STATIC_PAGES.authorGuidelines,
  "/processing-fee": STATIC_PAGES.processingFee,
  "/manuscript-guidelines": STATIC_PAGES.manuscriptGuidelines,
  "/peer-review-process": STATIC_PAGES.peerReview,
};

const StaticContentPage = () => {
  const location = useLocation();
  const page = useMemo(() => PAGE_BY_PATH[location.pathname] || STATIC_PAGES.aboutUs, [location.pathname]);

  return (
    <StaticPageLayout title={page.title} subtitle={page.subtitle}>
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[28px] border border-border bg-card p-8 shadow-soft">
          <div className="mb-4 flex items-center gap-2 text-primary">
            <BadgeCheck className="h-5 w-5" />
            <span className="text-sm font-medium uppercase tracking-[0.24em]">{page.accent}</span>
          </div>
          <p className="text-lg leading-8 text-muted-foreground">{page.intro}</p>
          <div className="mt-8 space-y-8">
            {page.sections.map((section) => (
              <div key={section.title} className="rounded-2xl border border-border/70 bg-background p-6">
                <h2 className="font-serif text-2xl font-semibold text-heading">{section.title}</h2>
                <p className="mt-3 leading-7 text-muted-foreground">{section.body}</p>
                <div className="mt-5 grid gap-3">
                  {section.points.map((point) => (
                    <div key={point} className="flex items-start gap-3">
                      <span className="mt-1.5 h-2.5 w-2.5 rounded-full bg-primary" />
                      <p className="text-sm leading-6 text-foreground">{point}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-border bg-card p-8 shadow-soft">
            <h2 className="font-serif text-2xl font-semibold text-heading">At A Glance</h2>
            <div className="mt-6 grid gap-4">
              {page.stats.map((item) => (
                <div key={item.label} className="rounded-2xl border border-border/70 bg-background p-5">
                  <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">{item.label}</p>
                  <p className="mt-2 font-serif text-2xl font-semibold text-heading">{item.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-border bg-card p-8 shadow-soft">
            <h2 className="font-serif text-2xl font-semibold text-heading">Need Help Next?</h2>
            <p className="mt-3 leading-7 text-muted-foreground">
              Use these pages as orientation, then continue to the journal section or submission flow when you are ready.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Button asChild>
                <a href="/journals">
                  Browse Journals
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/submit-and-register">Submit Manuscript</a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </StaticPageLayout>
  );
};

export default StaticContentPage;
