import { useState } from "react";
import {
  BadgeCheck,
  CreditCard,
  FileSearch,
  FileUp,
  RefreshCcw,
  Rocket,
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const PROCESS_STEPS = [
  {
    id: 1,
    label: "Submit",
    title: "Article Submission",
    icon: FileUp,
    summary: "Authors upload the manuscript, cover image, and core article details.",
    points: [
      "Create or sign in to your author account.",
      "Fill in article type, journal category, contact details, and word count.",
      "Upload the manuscript PDF and supporting cover image.",
    ],
  },
  {
    id: 2,
    label: "Verify",
    title: "Initial Verification",
    icon: FileSearch,
    summary: "The editorial team checks formatting, completeness, and journal-fit requirements.",
    points: [
      "The manuscript is reviewed for missing fields and upload quality.",
      "Basic screening confirms scope, originality, and submission readiness.",
      "Authors are notified if anything essential is incomplete.",
    ],
  },
  {
    id: 3,
    label: "Revise",
    title: "Corrections And Updates",
    icon: RefreshCcw,
    summary: "If changes are needed, the author updates the manuscript and resubmits the revised version.",
    points: [
      "Editorial comments or reviewer notes are shared with the author.",
      "The author updates content, references, formatting, or metadata.",
      "The revised manuscript is rechecked before final approval.",
    ],
  },
  {
    id: 4,
    label: "Pay",
    title: "Processing Fee",
    icon: CreditCard,
    summary: "Once the paper is approved for publication, payment and documentation are confirmed.",
    points: [
      "Authors receive publication or processing fee instructions.",
      "Payment confirmation is checked against the manuscript record.",
      "The article moves to the final publishing queue after clearance.",
    ],
  },
  {
    id: 5,
    label: "Publish",
    title: "Publication",
    icon: Rocket,
    summary: "The final article is published and made available to readers on the platform.",
    points: [
      "The accepted version is prepared for release.",
      "Article metadata and files are published to the journal listing.",
      "Readers can access the published article and the author can track status.",
    ],
  },
];

const SubmissionProcessSection = () => {
  const [activeStep, setActiveStep] = useState(PROCESS_STEPS[0].id);
  const { isDark } = useTheme();

  const currentStep = PROCESS_STEPS.find((step) => step.id === activeStep) || PROCESS_STEPS[0];
  const CurrentIcon = currentStep.icon;

  return (
    <section className={`py-16 md:py-24 ${isDark ? "bg-[#0d1120]" : "bg-secondary/40"}`}>
      <div className="container">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-3 flex items-center justify-center gap-2 text-primary">
            <BadgeCheck className="h-5 w-5" />
            <span className="text-sm font-medium uppercase tracking-[0.24em]">How It Works</span>
          </div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-heading">
            Follow the publishing process step by step
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Click each number to see what happens from manuscript submission to verification, updates, payment, and final publication.
          </p>
        </div>

        <div className="mt-10 rounded-[28px] border border-border bg-card p-5 shadow-soft md:p-8">
          <div className="flex items-center justify-center">
            <div className="grid w-full max-w-5xl grid-cols-5 gap-3 md:gap-5">
              {PROCESS_STEPS.map((step) => (
                <div key={step.id} className="relative flex flex-col items-center">
                  {step.id !== PROCESS_STEPS.length && (
                    <span
                      className={`absolute left-[calc(50%+1.8rem)] top-6 hidden h-px w-[calc(100%-1.2rem)] -translate-y-1/2 md:block ${
                        activeStep >= step.id ? "bg-primary/60" : "bg-border"
                      }`}
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => setActiveStep(step.id)}
                    className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border text-lg font-semibold transition-smooth md:h-16 md:w-16 md:text-2xl ${
                      activeStep === step.id
                        ? "border-primary bg-primary text-primary-foreground shadow-soft"
                        : "border-border bg-background hover:border-primary/40 hover:bg-secondary"
                    }`}
                  >
                    {step.id}
                  </button>
                  <div className={`mt-3 text-center text-[11px] font-medium uppercase tracking-wide md:text-xs ${activeStep === step.id ? "text-primary" : "text-muted-foreground"}`}>
                    {step.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mx-auto mt-10 max-w-4xl">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <CurrentIcon className="h-7 w-7" />
              </div>
              <div>
                <div className="text-sm font-medium uppercase tracking-[0.24em] text-primary">
                  Step {currentStep.id}
                </div>
                <h3 className="mt-2 font-serif text-2xl font-bold text-heading">
                  {currentStep.title}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                  {currentStep.summary}
                </p>
              </div>
            </div>

            <div className="mx-auto mt-8 max-w-3xl space-y-4">
              {currentStep.points.map((point, index) => (
                <div key={point} className="flex items-start gap-4 rounded-2xl border border-border/70 bg-background/70 p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {index + 1}
                  </div>
                  <p className="text-sm leading-6 text-foreground">{point}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SubmissionProcessSection;
