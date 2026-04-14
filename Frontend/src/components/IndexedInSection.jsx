import { Check } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import indexedInImage from "../../assets/indexed in.jpg";

const INDEXED_LABELS = ["MIAR", "Publons", "CINAHL Complete", "CineFactor"];

const IndexedInSection = () => {
  const { isDark } = useTheme();

  return (
    <section className={`py-16 md:py-20 ${isDark ? "bg-[#090c18]" : "bg-background"}`}>
      <div className="container">
        <div className="rounded-2xl border border-border bg-card p-6 md:p-8 lg:p-10 shadow-soft">
          <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
            <div className="space-y-5">
              <h2 className="font-serif text-3xl md:text-4xl font-bold text-heading">Indexed In</h2>
              <p className="text-muted-foreground max-w-2xl">
                QuiLive journals are listed across established indexing and discovery platforms that improve
                visibility, citation reach, and research discoverability.
              </p>

              <div className="overflow-hidden rounded-xl border border-border bg-secondary/40">
                <img
                  src={indexedInImage}
                  alt="Indexed platforms"
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
              </div>
            </div>

            <div className="rounded-xl border border-border bg-background/70 p-5 md:p-6">
              <p className="text-sm uppercase tracking-[0.18em] text-muted-foreground mb-4">Current Listings</p>
              <ul className="space-y-4">
                {INDEXED_LABELS.map((item) => (
                  <li key={item} className="flex items-center gap-3 text-base md:text-lg text-foreground">
                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary/15 text-primary">
                      <Check className="h-4 w-4" />
                    </span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IndexedInSection;