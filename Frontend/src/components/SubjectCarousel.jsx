import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import { useAppData } from "@/context/AppDataContext";
import { JOURNAL_OPTIONS } from "@/data/journalOptions";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const SubjectCarousel = () => {
  const { isDark } = useTheme();
  const { journals } = useAppData();

  const subjects = JOURNAL_OPTIONS.map((journal, index) => ({
    id: index + 1,
    name: journal.title,
    image: journal.image,
    articleCount: journals.filter((article) => article.journalName === journal.title).length,
    journalId: journal.id,
  }));

  return (
    <section
      className={`py-16 md:py-24 ${isDark ? "bg-[#0b0e1a]" : "bg-secondary/30"}`}
    >
      <div className="container">
        {/* Section Header */}
        <div className="text-center mb-10 md:mb-12">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-heading mb-4">
            Browse by Subject
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Explore our vast collection of peer-reviewed research across various academic disciplines.
          </p>
        </div>

        {/* Carousel */}
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {subjects.map((subject) => (
              <CarouselItem key={subject.id} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                <Link to={`/journals?journal=${encodeURIComponent(subject.journalId)}`}>
                  <div className="group relative overflow-hidden rounded-xl aspect-[4/3] cursor-pointer">
                    {/* Image */}
                    <img
                      src={subject.image}
                      alt={subject.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    
                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    
                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className="font-serif text-lg md:text-xl font-semibold mb-1 group-hover:text-primary transition-colors">
                        {subject.name}
                      </h3>
                      <p className="text-sm text-white/70">
                        {subject.articleCount.toLocaleString()} articles
                      </p>
                    </div>
                  </div>
                </Link>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex -left-4 bg-background border-border hover:bg-secondary" />
          <CarouselNext className="hidden md:flex -right-4 bg-background border-border hover:bg-secondary" />
        </Carousel>

        {/* View All Link */}
        <div className="text-center mt-8">
          <Link to="/journals">
            <Button variant="outline" size="lg">
              View All Journals
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default SubjectCarousel;
