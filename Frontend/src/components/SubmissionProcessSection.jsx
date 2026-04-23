import { useEffect, useState } from "react";
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
    label: "Submission",
    title: "Submission",
    icon: FileUp,
    summary: "Authors submit manuscript files and required publication details.",
    points: [
      "Provide article and author information.",
      "Select journal and article type.",
      "Upload manuscript and cover image.",
    ],
  },
  {
    id: 2,
    label: "Pre-QC",
    title: "Pre-QC",
    icon: FileSearch,
    summary: "The editorial team performs preliminary quality and completeness checks.",
    points: [
      "Basic formatting and scope are reviewed.",
      "Missing information is identified.",
      "Submissions move forward only after initial quality check.",
    ],
  },
  {
    id: 3,
    label: "Review",
    title: "Review Process",
    icon: RefreshCcw,
    summary: "Assigned reviewers and editors evaluate the manuscript in detail.",
    points: [
      "Editorial observations are recorded.",
      "Technical and content checks are completed.",
      "Review outcomes are prepared for final decision.",
    ],
  },
  {
    id: 4,
    label: "Pay",
    title: "Pay",
    icon: CreditCard,
    summary: "Required publication payment is completed and verified.",
    points: [
      "Payment instructions are shared with the author.",
      "Transaction confirmation is validated.",
      "Article moves to final decision stage.",
    ],
  },
  {
    id: 5,
    label: "Decision",
    title: "Editorial Decision",
    icon: BadgeCheck,
    summary: "The editorial team makes the final acceptance decision.",
    points: [
      "Review and QC results are consolidated.",
      "Final editorial decision is issued.",
      "Accepted papers proceed to publication.",
    ],
  },
  {
    id: 6,
    label: "Publish",
    title: "Publish",
    icon: Rocket,
    summary: "The accepted manuscript is published for readers.",
    points: [
      "Final metadata and files are released.",
      "Article appears in the journal listing.",
      "Readers can view and download the published work.",
    ],
  },
];

const SubmissionProcessSection = () => {
  const [activeStep, setActiveStep] = useState(PROCESS_STEPS[0].id);
  const { isDark } = useTheme();

  const currentStep = PROCESS_STEPS.find((step) => step.id === activeStep) || PROCESS_STEPS[0];
  const CurrentIcon = currentStep.icon;

  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveStep((prev) => {
        const currentIndex = PROCESS_STEPS.findIndex((step) => step.id === prev);
        const nextIndex = (currentIndex + 1) % PROCESS_STEPS.length;
        return PROCESS_STEPS[nextIndex].id;
      });
    }, 3000);

    return () => clearInterval(intervalId);
  }, []);

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
            Click each number to see every stage from submission to publish.
          </p>
        </div>

        <div className="mt-10 rounded-[28px] border border-border bg-card p-5 shadow-soft md:p-8">
          <div className="flex items-center justify-center">
            <div className="grid w-full max-w-5xl grid-cols-3 gap-3 md:grid-cols-6 md:gap-5">
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
