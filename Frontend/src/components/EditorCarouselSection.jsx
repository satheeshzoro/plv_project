import { ImageOff, Mail, MapPin, UserRound } from "lucide-react";
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
  const { editors } = useAppData();
  const { isDark } = useTheme();
  const editorProfiles = (editors || []).filter(
    (editor) => editor?.name || editor?.email || editor?.penName || editor?.country,
  );

  return (
    <section className={`py-12 md:py-16 ${isDark ? "bg-[#090b15]" : "bg-background"}`}>
      <div className="container">
        <div className="mb-6">
          <h2 className="font-serif text-2xl md:text-3xl font-bold text-heading">
            Meet Our Editors
          </h2>
          <p className="text-muted-foreground text-sm md:text-base mt-1">
            Editorial team members guiding review quality and publication standards.
          </p>
        </div>

        {editorProfiles.length > 0 ? (
          <Carousel
            opts={{
              align: "start",
              loop: editorProfiles.length > 1,
            }}
            className="w-full"
          >
            <CarouselContent>
              {editorProfiles.map((editor) => (
                <CarouselItem key={editor.id} className="md:basis-1/2 xl:basis-1/3">
                  <div className="h-full rounded-2xl border border-border bg-card p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-semibold text-primary">
                        {editor.name?.trim()?.charAt(0)?.toUpperCase() || "E"}
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate font-serif text-xl font-semibold text-heading">
                          {editor.name || "Editor"}
                        </h3>
                        <p className="truncate text-sm text-primary">
                          {editor.penName || "Editorial Board Member"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 space-y-3 text-sm text-muted-foreground">
                      <div className="flex items-start gap-3">
                        <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                        <span className="break-all">{editor.email || "No email available"}</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                        <span>{editor.country || "Country not provided"}</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <UserRound className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                        <span>{editor.penName || "No pen name provided"}</span>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {editorProfiles.length > 1 ? (
              <>
                <CarouselPrevious className="hidden md:flex -left-4" />
                <CarouselNext className="hidden md:flex -right-4" />
              </>
            ) : null}
          </Carousel>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
            <ImageOff className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium text-foreground">There is no data to show</p>
            <p className="text-sm text-muted-foreground mt-1">
              No editor images or details are available right now.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default EditorCarouselSection;
