import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/context/ThemeContext";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const SUBJECTS = [
  {
    id: 1,
    name: "Computer Science",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&h=300&fit=crop",
    articleCount: 1234,
  },
  {
    id: 2,
    name: "Medical Sciences",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&h=300&fit=crop",
    articleCount: 2156,
  },
  {
    id: 3,
    name: "Business & Economics",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop",
    articleCount: 987,
  },
  {
    id: 4,
    name: "Humanities",
    image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400&h=300&fit=crop",
    articleCount: 1567,
  },
  {
    id: 5,
    name: "Engineering",
    image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop",
    articleCount: 1890,
  },
  {
    id: 6,
    name: "Environmental Science",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=300&fit=crop",
    articleCount: 756,
  },
  {
    id: 7,
    name: "Physics",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=300&fit=crop",
    articleCount: 1123,
  },
  {
    id: 8,
    name: "Psychology",
    image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=400&h=300&fit=crop",
    articleCount: 1432,
  },
];

const SubjectCarousel = () => {
  const { isDark } = useTheme();

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
            {SUBJECTS.map((subject) => (
              <CarouselItem key={subject.id} className="pl-2 md:pl-4 basis-1/2 md:basis-1/3 lg:basis-1/4">
                <Link to={`/journals?category=${encodeURIComponent(subject.name)}`}>
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