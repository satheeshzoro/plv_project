import { Star } from "lucide-react";

const JournalRating = ({ rating, compact = false }) => {
  const stars = Math.round(rating?.overall || 0);

  if (compact) {
    return (
      <div className="inline-flex items-center gap-2">
        <div className="flex items-center gap-0.5 text-amber-500">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Star
              key={idx}
              className={`w-3.5 h-3.5 ${idx < stars ? "fill-current" : "text-muted-foreground/40"}`}
            />
          ))}
        </div>
        <span className="text-sm font-medium text-foreground">
          {rating?.overall?.toFixed(1)} / 5
        </span>
        <span className="text-xs text-muted-foreground">({rating?.votes || 0} ratings)</span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Reader Confidence</p>
      <div className="flex items-center gap-2 mb-3">
        <span className="font-serif text-3xl font-bold text-heading">
          {rating?.overall?.toFixed(1)}
        </span>
        <div className="flex items-center gap-0.5 text-amber-500">
          {Array.from({ length: 5 }).map((_, idx) => (
            <Star
              key={idx}
              className={`w-4 h-4 ${idx < stars ? "fill-current" : "text-muted-foreground/40"}`}
            />
          ))}
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-4">{rating?.votes || 0} verified ratings</p>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="rounded-md bg-secondary p-2">
          <p className="text-muted-foreground">Editorial</p>
          <p className="font-semibold text-foreground">{rating?.editorial?.toFixed(1)}</p>
        </div>
        <div className="rounded-md bg-secondary p-2">
          <p className="text-muted-foreground">Review</p>
          <p className="font-semibold text-foreground">{rating?.review?.toFixed(1)}</p>
        </div>
        <div className="rounded-md bg-secondary p-2">
          <p className="text-muted-foreground">Visibility</p>
          <p className="font-semibold text-foreground">{rating?.visibility?.toFixed(1)}</p>
        </div>
      </div>
    </div>
  );
};

export default JournalRating;