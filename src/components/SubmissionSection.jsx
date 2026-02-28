import { useState } from "react";
import { Send, FileText, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CATEGORIES } from "@/data/mockData";

const SubmissionSection = ({ isLoggedIn, onRequireAuth }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    abstract: "",
    category: "",
    content: "",
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      onRequireAuth();
      return;
    }

    // Validate form
    if (!formData.title || !formData.abstract || !formData.category || !formData.content) {
      toast({
        title: "Incomplete Form",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    toast({
      title: "Submission Received!",
      description: "Your research is pending review by our Subject Matter Experts. We'll notify you within 5-7 business days.",
    });

    // Reset form
    setFormData({ title: "", abstract: "", category: "", content: "" });
    setIsSubmitting(false);
  };

  return (
    <section id="submit" className="py-16 md:py-24 bg-secondary/30">
      <div className="container">
        <div className="max-w-3xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-10 md:mb-12">
            <div className="inline-flex items-center justify-center w-14 h-14 mb-4 bg-primary/10 text-primary rounded-2xl">
              <FileText className="w-7 h-7" />
            </div>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-heading mb-4">
              Submit Your Research
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Share your findings with the global academic community. All submissions undergo rigorous peer review.
            </p>
          </div>

          {/* Submission Form */}
          <form onSubmit={handleSubmit} className="surface-elevated rounded-2xl shadow-soft p-6 md:p-10 border border-border/50">
            <div className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <label htmlFor="title" className="block text-sm font-medium text-foreground">
                  Research Title <span className="text-destructive">*</span>
                </label>
                <Input
                  id="title"
                  placeholder="Enter the title of your research paper"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className="bg-background border-border focus:ring-primary"
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label htmlFor="category" className="block text-sm font-medium text-foreground">
                  Category <span className="text-destructive">*</span>
                </label>
                <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
                  <SelectTrigger className="bg-background border-border">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Abstract */}
              <div className="space-y-2">
                <label htmlFor="abstract" className="block text-sm font-medium text-foreground">
                  Abstract <span className="text-destructive">*</span>
                </label>
                <Textarea
                  id="abstract"
                  placeholder="Provide a brief summary of your research (max 300 words)"
                  rows={3}
                  value={formData.abstract}
                  onChange={(e) => handleChange("abstract", e.target.value)}
                  className="bg-background border-border focus:ring-primary resize-none"
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <label htmlFor="content" className="block text-sm font-medium text-foreground">
                  Full Content <span className="text-destructive">*</span>
                </label>
                <Textarea
                  id="content"
                  placeholder="Paste or write your complete research paper here..."
                  rows={8}
                  value={formData.content}
                  onChange={(e) => handleChange("content", e.target.value)}
                  className="bg-background border-border focus:ring-primary resize-none"
                />
              </div>

              {/* Guidelines */}
              <div className="p-4 bg-secondary/50 rounded-lg">
                <h4 className="text-sm font-medium text-foreground mb-2">Submission Guidelines</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Ensure your research is original and has not been published elsewhere</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Include proper citations and references in your content</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <span>Review process typically takes 5-7 business days</span>
                  </li>
                </ul>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                size="lg" 
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    Submit for Review
                  </span>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default SubmissionSection;
