import { Mail, MapPin, MessageSquareText, Phone } from "lucide-react";
import StaticPageLayout from "@/components/StaticPageLayout";
import { useAppData } from "@/context/AppDataContext";

const ContactPage = () => {
  const { settings } = useAppData();
  const contact = settings?.contact || {};
  const email = contact.helplineEmail || "Info@quilivepublishers.com";
  const phone = contact.helplineNumber || "Contact number not configured";

  return (
    <StaticPageLayout
      title="Contact"
      subtitle="Reach out for submission queries, publication support, author guidance, or editorial clarification."
    >
      <section className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-[28px] border border-border bg-card p-8 shadow-soft">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            Contact QuiLive
          </div>
          <h2 className="font-serif text-3xl font-bold text-heading">Publishing support and editorial assistance</h2>
          <p className="mt-4 text-lg leading-8 text-muted-foreground">
            The public QuiLive contact page centers on direct enquiry support for manuscript-related questions. This in-app page keeps that purpose but presents it in the current application style.
          </p>

          <div className="mt-8 grid gap-4">
            <div className="rounded-2xl border border-border/70 bg-background p-5">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">Email</span>
              </div>
              <p className="mt-3 text-lg text-foreground">{email}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background p-5">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">Phone</span>
              </div>
              <p className="mt-3 text-lg text-foreground">{phone}</p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background p-5">
              <div className="flex items-center gap-3">
                <MessageSquareText className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground">Best Use</span>
              </div>
              <p className="mt-3 text-lg text-foreground">Submission enquiries, APC clarification, and journal-specific questions</p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-border bg-card p-8 shadow-soft">
          <h2 className="font-serif text-2xl font-semibold text-heading">Before You Contact Us</h2>
          <div className="mt-6 space-y-5">
            <div className="rounded-2xl border border-border/70 bg-background p-5">
              <h3 className="font-medium text-foreground">For authors</h3>
              <p className="mt-2 leading-7 text-muted-foreground">
                Include your manuscript title, selected journal, article type, and the email used for submission so support can respond faster.
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background p-5">
              <h3 className="font-medium text-foreground">For status checks</h3>
              <p className="mt-2 leading-7 text-muted-foreground">
                Keep the manuscript ID and corresponding author email ready when asking for review or processing updates.
              </p>
            </div>
            <div className="rounded-2xl border border-border/70 bg-background p-5">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" />
                <h3 className="font-medium text-foreground">Reference Source</h3>
              </div>
              <p className="mt-2 leading-7 text-muted-foreground">
                This page is adapted from the public QuiLive contact messaging and aligned with the app's current design system.
              </p>
            </div>
          </div>
        </div>
      </section>
    </StaticPageLayout>
  );
};

export default ContactPage;
