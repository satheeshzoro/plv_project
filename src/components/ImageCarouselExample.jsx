import ImageCarouselCard from "@/components/ImageCarouselCard";

const DUMMY_CAROUSEL_ITEMS = [
  {
    imageUrl:
      "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1100&h=760&fit=crop",
    title: "Clinical Research Dashboard",
    subtitle: "Publication Growth",
    description:
      "Monitor submissions, editorial decisions, and acceptance velocity with a single command center.",
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=1100&h=760&fit=crop",
    title: "Smart Peer Review Insights",
    subtitle: "Quality Signals",
    description:
      "Track reviewer turnaround, revision quality, and subject-wise editorial performance in real time.",
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=1100&h=760&fit=crop",
    title: "Open Access Distribution",
    subtitle: "Global Reach",
    description:
      "Expand article visibility through indexing-ready metadata and broad, open readership channels.",
  },
  {
    imageUrl:
      "https://images.unsplash.com/photo-1518773553398-650c184e0bb3?w=1100&h=760&fit=crop",
    title: "Editorial Automation Layer",
    subtitle: "Fast Decisions",
    description:
      "Automate assignment, follow-up, and communication without losing scientific rigor and transparency.",
  },
];

const ImageCarouselExample = () => {
  return (
    <section className="py-14 md:py-20 bg-background">
      <div className="container">
        <div className="mb-8 text-center">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-heading">Stacked Image Carousel</h2>
          <p className="text-muted-foreground mt-2">
            Reusable `ImageCarouselCard` component with layered depth animation and dynamic content.
          </p>
        </div>
        <ImageCarouselCard items={DUMMY_CAROUSEL_ITEMS} />
      </div>
    </section>
  );
};

export default ImageCarouselExample;