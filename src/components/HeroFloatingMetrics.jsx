import { useMemo } from "react";
import { useAppData } from "@/context/AppDataContext";

const formatNumber = (value = 0) => new Intl.NumberFormat().format(value);

const HeroFloatingMetrics = () => {
  const { siteMetrics } = useAppData();

  const metrics = useMemo(
    () => [
      { label: "Article Submissions", value: siteMetrics?.submissionsCount || 0 },
      { label: "Website Visits", value: siteMetrics?.websiteVisits || 0 },
      { label: "Registered Users", value: siteMetrics?.registeredUsersCount || 0 },
      { label: "Published Articles", value: siteMetrics?.publishedArticlesCount || 0 },
    ],
    [siteMetrics]
  );

  return (
    <>
      <div className="hidden lg:block absolute left-4 top-28 z-20">
        <MetricBadge metric={metrics[0]} />
      </div>
      <div className="hidden lg:block absolute right-6 top-32 z-20">
        <MetricBadge metric={metrics[1]} />
      </div>
      <div className="hidden lg:block absolute left-16 bottom-14 z-20">
        <MetricBadge metric={metrics[2]} />
      </div>
      <div className="hidden lg:block absolute right-10 bottom-16 z-20">
        <MetricBadge metric={metrics[3]} />
      </div>

      <div className="lg:hidden mt-8 grid grid-cols-2 gap-3">
        {metrics.map((metric) => (
          <MetricBadge key={metric.label} metric={metric} compact />
        ))}
      </div>
    </>
  );
};

const MetricBadge = ({ metric, compact = false }) => (
  <div
    className={`rounded-xl border border-border bg-card px-4 py-3 backdrop-blur-md shadow-soft transition-smooth hover:-translate-y-0.5 ${compact ? "" : "min-w-[190px]"}`}
  >
    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
      {metric.label}
    </p>
    <p className="text-xl font-semibold text-heading">
      {formatNumber(metric.value)}
    </p>
  </div>
);

export default HeroFloatingMetrics;