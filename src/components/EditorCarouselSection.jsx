import { ImageOff } from "lucide-react";
import { useAppData } from "@/context/AppDataContext";
import { useTheme } from "@/context/ThemeContext";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const EditorCarouselSection = () => {
  const { settings } = useAppData();
  const { isDark } = useTheme();
  const images = settings?.carouselImages || [];

  return (
    <section className={`py-12 md:py-16 ${isDark ? "bg-[#090b15]" : "bg-background"}`}>
      <div className="container">
        <div className="mb-6">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-heading">
            Editor Carousel
          </h2>
          <p className="text-muted-foreground text-sm md:text-base mt-1">
            Showcase banners managed from editor/admin dashboard.
          </p>
        </div>

        {images.length > 0 ? (
          <Carousel
            opts={{
              align: "start",
              loop: images.length > 1,
            }}
            className="w-full"
          >
            <CarouselContent>
              {images.map((url, index) => (
                <CarouselItem key={`${url}-${index}`}>
                  <div className="overflow-hidden rounded-xl border border-border bg-card">
                    <img
                      src={url}
                      alt={`Editor carousel ${index + 1}`}
                      className="w-full h-[220px] md:h-[320px] object-cover"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {images.length > 1 ? (
              <>
                <CarouselPrevious className="hidden md:flex -left-4" />
                <CarouselNext className="hidden md:flex -right-4" />
              </>
            ) : null}
          </Carousel>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
            <ImageOff className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium text-foreground">No images added</p>
            <p className="text-sm text-muted-foreground mt-1">
              No data added in editor carousel. This section is currently limited.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default EditorCarouselSection;