import { Link } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import ArticleCard from "./ArticleCard";
import { useAppData } from "@/context/AppDataContext";
import { useTheme } from "@/context/ThemeContext";

const TrendingArticles = () => {
  const { trendingArticles } = useAppData();
  const { isDark } = useTheme();

  return (
    <section
      id="articles"
      className={`py-16 md:py-24 ${isDark ? "bg-gradient-to-b from-[#080910] to-[#0f1220]" : "bg-background"}`}
    >
      <div className="container">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-10 md:mb-12">
          <div>
            <div className="flex items-center gap-2 text-primary mb-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-medium uppercase tracking-wide">Trending</span>
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-heading">
              Popular This Week
            </h2>
          </div>
          <Link
            to="/articles"
            className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-accent transition-smooth"
          >
            View All Articles
            <span className="text-lg">→</span>
          </Link>
        </div>

        {/* Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {trendingArticles.length > 0 ? (
            trendingArticles.map((article, index) => (
              <ArticleCard key={article.id} article={article} index={index} />
            ))
          ) : (
            <div className="col-span-full text-center text-muted-foreground py-12">No articles published yet.</div>
          )}
        </div>

        {/* Mobile View All */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            to="/articles"
            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-accent transition-smooth"
          >
            View All Articles
            <span className="text-lg">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default TrendingArticles;
