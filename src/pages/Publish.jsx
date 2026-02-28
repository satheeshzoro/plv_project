import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Send, Upload, FileText, CheckCircle2, ArrowLeft, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAppData } from "@/context/AppDataContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const ARTICLE_TYPES = [
  "Research Paper",
  "Review Article",
  "Case Study",
  "Technical Report",
  "Short Communication",
];

const JOURNAL_TYPES = [
  "Computer Science",
  "Medical Sciences",
  "Business & Economics",
  "Engineering",
  "Humanities",
  "Environmental Science",
  "Biotechnology",
  "Physics",
  "Mathematics",
];

const Publish = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addSubmission, currentUser, logoutUser } = useAppData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [file, setFile] = useState(null);
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    country: "",
    whatsapp: "",
    articleType: "",
    journalType: "",
    wordCount: "",
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      // Create a fake local URL for preview purposes
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.fullName || !formData.email || !formData.country || !formData.articleType || !formData.journalType || !formData.wordCount || !file || !image) {
      toast({
        title: "Incomplete Form",
        description: "Please fill in all required fields and upload a PDF.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const submissionData = new FormData();
      submissionData.append("full_name", formData.fullName);
      submissionData.append("email", formData.email);
      submissionData.append("country", formData.country);
      submissionData.append("whatsapp", formData.whatsapp);
      submissionData.append("article_type", formData.articleType);
      submissionData.append("category", formData.journalType);
      submissionData.append("word_count", formData.wordCount);
      submissionData.append("file", file);
      submissionData.append("image", image);

      await addSubmission(submissionData);
    } catch (error) {
      setIsSubmitting(false);
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your research. Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Submission Received!",
      description: "Your research has been submitted for review. Track status in your dashboard.",
    });

    // Reset form
    setFormData({
      fullName: "",
      email: "",
      country: "",
      whatsapp: "",
      articleType: "",
      journalType: "",
      wordCount: "",
    });
    setFile(null);
    setImage(null);
    setImagePreview(null);
    setIsSubmitting(false);

    // Optionally redirect to dashboard
    if (currentUser) {
      navigate("/user/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar 
        isLoggedIn={!!currentUser}
        user={currentUser}
        onSignIn={() => navigate("/")}
        onSignUp={() => navigate("/")}
        onSignOut={() => {
          logoutUser();
          navigate("/");
        }}
      />

      <main className="py-12 md:py-20">
        <div className="container max-w-2xl">
          {/* Back Link */}
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-smooth mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          {/* Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-primary/10 text-primary rounded-2xl">
              <FileText className="w-8 h-8" />
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-bold text-heading mb-3">
              Submit Your Research
            </h1>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Share your findings with the global academic community. All submissions undergo rigorous peer review.
            </p>
          </div>

          {/* Submission Form */}
          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-2xl p-6 md:p-10">
            <div className="space-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="fullName"
                  placeholder="Dr. John Smith"
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="john.smith@university.edu"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>

              {/* Country & WhatsApp in grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">
                    Country <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="country"
                    placeholder="United States"
                    value={formData.country}
                    onChange={(e) => handleChange("country", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="whatsapp">WhatsApp Number</Label>
                  <Input
                    id="whatsapp"
                    placeholder="+1 234 567 8900"
                    value={formData.whatsapp}
                    onChange={(e) => handleChange("whatsapp", e.target.value)}
                  />
                </div>
              </div>

              {/* Article Type & Journal Type in grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>
                    Article Type <span className="text-destructive">*</span>
                  </Label>
                  <Select value={formData.articleType} onValueChange={(value) => handleChange("articleType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ARTICLE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>
                    Journal Category <span className="text-destructive">*</span>
                  </Label>
                  <Select value={formData.journalType} onValueChange={(value) => handleChange("journalType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {JOURNAL_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Word Count */}
              <div className="space-y-2">
                <Label htmlFor="wordCount">
                  Word Count <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="wordCount"
                  type="number"
                  placeholder="e.g. 3500"
                  value={formData.wordCount}
                  onChange={(e) => handleChange("wordCount", e.target.value)}
                />
              </div>

              {/* Image Upload */}
              <div className="space-y-2">
                <Label>
                  Cover Image <span className="text-destructive">*</span>
                </Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer block">
                    {imagePreview ? (
                      <div className="relative">
                        <img src={imagePreview} alt="Preview" className="h-48 w-full object-cover rounded-md mx-auto" />
                        <p className="mt-2 text-primary font-medium">{image?.name}</p>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                        <p className="text-foreground font-medium">Click to upload Cover Image</p>
                        <p className="text-sm text-muted-foreground mt-1">Recommended: 600x400px (JPG, PNG)</p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* File Upload */}
              <div className="space-y-2">
                <Label>
                  Upload PDF <span className="text-destructive">*</span>
                </Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                    {file ? (
                      <p className="text-primary font-medium">{file.name}</p>
                    ) : (
                      <>
                        <p className="text-foreground font-medium">Click to upload your PDF</p>
                        <p className="text-sm text-muted-foreground mt-1">Max file size: 20MB</p>
                      </>
                    )}
                  </label>
                </div>
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
                    <span>Include proper citations and references in your document</span>
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
                className="w-full"
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
      </main>

      <Footer />
    </div>
  );
};

export default Publish;