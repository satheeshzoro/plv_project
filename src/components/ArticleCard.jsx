import { Clock, ArrowUpRight } from "lucide-react";
import { useAppData } from "@/context/AppDataContext";

const ArticleCard = ({ article, index }) => {
  const { id, title, author, date, publishedDate, category, readTime, image, excerpt, file } = article;
  const { recordArticleView } = useAppData();

  const getFullUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    const backend = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
    if (url.startsWith("/media")) return `${backend}${url}`;
    const path = url.startsWith("/") ? url : `/${url}`;
    return `${backend}/media${path}`;
  };

  const handleReadMore = async () => {
    const fileUrl = getFullUrl(file);
    await recordArticleView(id);
    if (fileUrl) {
      window.open(fileUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <article 
      className="group surface-elevated rounded-xl overflow-hidden shadow-soft hover:shadow-soft-lg transition-smooth border border-border/50 animate-slide-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Image */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <img
          src={getFullUrl(image) || "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=400&fit=crop"}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=400&fit=crop"; }} // Fallback image
        />
        <div className="absolute top-4 left-4">
          <span className="inline-block px-3 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-full">
            {category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 md:p-6">
        {/* Meta */}
        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
          <span>{author}</span>
          <span className="w-1 h-1 bg-muted-foreground rounded-full" />
          <span>{date || publishedDate}</span>
        </div>

        {/* Title */}
        <h3 className="font-serif text-lg md:text-xl font-semibold text-heading mb-3 leading-snug group-hover:text-primary transition-smooth line-clamp-2">
          {title}
        </h3>

        {/* Excerpt */}
        <p className="text-muted-foreground text-sm leading-relaxed mb-4 line-clamp-2">
          {excerpt}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{readTime || "5 min read"}</span>
          </div>
          <button
            type="button"
            onClick={handleReadMore}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-accent transition-smooth group/link"
          >
            Read More
            <ArrowUpRight className="w-4 h-4 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
          </button>
        </div>
      </div>
    </article>
  );
};

export default ArticleCard;
