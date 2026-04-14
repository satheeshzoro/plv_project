import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./ImageCarouselCard.css";

const normalizeIndex = (value, length) => {
  if (!length) return 0;
  return (value + length) % length;
};

const ImageCarouselCard = ({ items = [] }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const activeItem = items[activeIndex] || {
    imageUrl: "",
    title: "No items",
    subtitle: "",
    description: "No carousel items provided.",
  };

  const stack = useMemo(
    () =>
      [0, 1, 2, 3]
        .map((depth) => {
          const index = normalizeIndex(activeIndex + depth, items.length);
          return { depth, index, item: items[index] };
        })
        .filter(({ item }) => !!item),
    [activeIndex, items]
  );

  const handleNext = () => {
    if (items.length <= 1) return;
    setActiveIndex((prev) => normalizeIndex(prev + 1, items.length));
  };

  const handlePrev = () => {
    if (items.length <= 1) return;
    setActiveIndex((prev) => normalizeIndex(prev - 1, items.length));
  };

  return (
    <article className="image-carousel-card">
      <div className="image-carousel-left">
        <div className="image-stack-shell">
          {stack.map(({ depth, index, item }) => {
            const scale = depth === 0 ? 1 : depth === 1 ? 0.9 : depth === 2 ? 0.85 : 0.8;
            const opacity = depth === 0 ? 1 : depth === 1 ? 0.52 : depth === 2 ? 0.28 : 0.15;
            const blur = depth === 0 ? 0 : depth === 1 ? 1.4 : depth === 2 ? 2.6 : 3.6;
            const translateX = depth * 24;
            const translateY = depth * 14;

            return (
              <figure
                key={`${index}-${item.title}`}
                className="stack-image absolute inset-0 rounded-2xl overflow-hidden border border-border/60 transition-all duration-700"
                style={{
                  zIndex: 50 - depth,
                  opacity,
                  filter: `blur(${blur}px)`,
                  transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`,
                  transitionTimingFunction: "cubic-bezier(0.22, 0.61, 0.36, 1)",
                }}
              >
                <img src={item.imageUrl} alt={item.title} loading={depth === 0 ? "eager" : "lazy"} />
              </figure>
            );
          })}
        </div>

        <div className="stack-controls">
          <button type="button" onClick={handlePrev} aria-label="Previous item">
            <ChevronLeft size={18} />
          </button>
          <button type="button" onClick={handleNext} aria-label="Next item">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="image-carousel-right">
        <p className="carousel-eyebrow">Featured</p>
        <h3>{activeItem.title}</h3>
        <h4>{activeItem.subtitle}</h4>
        <p>{activeItem.description}</p>
      </div>
    </article>
  );
};

export default ImageCarouselCard;