import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Send, FileText, Clock, CheckCircle, AlertCircle, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAppData } from "@/context/AppDataContext";
import { ARTICLE_TYPES, JOURNAL_CATEGORY_BY_TITLE, JOURNAL_OPTIONS } from "@/data/journalOptions";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import mainImage from "../../assets/main.png";

const StatusBadge = ({ status }) => {
  const statusConfig = {
    Pending: { icon: Clock, className: "bg-yellow-100 text-yellow-800" },
    "Under Review": { icon: AlertCircle, className: "bg-blue-100 text-blue-800" },
    Completed: { icon: CheckCircle, className: "bg-green-100 text-green-800" },
    Published: { icon: CheckCircle, className: "bg-emerald-100 text-emerald-800" },
    Rejected: { icon: AlertCircle, className: "bg-red-100 text-red-800" },
  };

  const config = statusConfig[status] || statusConfig.Pending;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
      <Icon className="w-3 h-3" />
      {status}
    </span>
  );
};

const UserDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { submissions, addSubmission, currentUser, logoutUser, isAuthChecking } = useAppData();
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    country: "",
    whatsapp: "",
    journalName: "",
    articleType: "",
    journalType: "",
    wordCount: "",
    file: null,
    image: null,
  });

  if (isAuthChecking) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Redirect if not logged in
  if (!currentUser) {
    navigate("/");
    return null;
  }

  const userSubmissions = submissions.filter(
    (s) => s.email === formData.email || s.email === currentUser?.email
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    if (name === "journalName") {
      setFormData((prev) => ({
        ...prev,
        journalName: value,
        journalType: JOURNAL_CATEGORY_BY_TITLE[value] || "",
      }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, file: file }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ 
        ...prev, 
        image: file,
        imagePreview: URL.createObjectURL(file) // Keep a preview URL for UI if needed
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email || !formData.journalName || !formData.articleType || !formData.journalType || !formData.wordCount || !formData.file || !formData.image) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const submissionData = new FormData();
      submissionData.append("full_name", formData.fullName);
      submissionData.append("email", formData.email);
      submissionData.append("country", formData.country);
      submissionData.append("whatsapp", formData.whatsapp);
      submissionData.append("journal_name", formData.journalName);
      submissionData.append("article_type", formData.articleType);
      submissionData.append("category", formData.journalType);
      submissionData.append("word_count", formData.wordCount);
      submissionData.append("file", formData.file);
      submissionData.append("image", formData.image);

      await addSubmission(submissionData);
      
      toast({
        title: "Submission Successful!",
        description: "Your work has been submitted for review.",
      });

      setFormData({
        fullName: "",
        email: "",
        country: "",
        whatsapp: "",
        journalName: "",
        articleType: "",
        journalType: "",
        wordCount: "",
        file: null,
        image: null,
      });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your research.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="app-shell min-h-screen bg-background">
      <Navbar 
        isLoggedIn={true}
        user={currentUser}
        onSignOut={() => {
          logoutUser();
          navigate("/");
        }}
      />

      <main className="py-12 md:py-16">
        <div className="container max-w-5xl">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-smooth mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          <section className="role-hero mb-10 grid gap-8 p-6 md:grid-cols-[1.1fr_0.9fr] md:p-8">
            <div className="relative z-10">
              <span className="brand-badge">Author Workspace</span>
              <h1 className="mt-5 font-serif text-4xl font-bold text-heading md:text-5xl">
                Submit your research and track the full editorial journey.
              </h1>
              <p className="mt-4 max-w-2xl text-muted-foreground">
                Keep your manuscript details ready, send new work for review, and monitor every decision from submission to publication.
              </p>
            </div>
            <div className="brand-image-frame p-4">
              <img src={mainImage} alt="Author submission workspace" className="w-full object-contain" />
            </div>
          </section>

          <Tabs defaultValue="submit" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="submit" className="flex items-center gap-2">
                <Send className="w-4 h-4" />
                Submit Work
              </TabsTrigger>
              <TabsTrigger value="track" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Track Status
              </TabsTrigger>
            </TabsList>

            <TabsContent value="submit" className="space-y-6">
              <div className="bg-card border border-border rounded-lg p-6 md:p-8">
                <h2 className="font-serif text-xl font-semibold text-heading mb-6">
                  Submit Your Research
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="Dr. John Doe"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="john.doe@university.edu"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        placeholder="United States"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="whatsapp">WhatsApp Number</Label>
                      <Input
                        id="whatsapp"
                        name="whatsapp"
                        value={formData.whatsapp}
                        onChange={handleInputChange}
                        placeholder="+1 234 567 8900"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Journal Name *</Label>
                      <Select
                        value={formData.journalName}
                        onValueChange={(value) => handleSelectChange("journalName", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select journal" />
                        </SelectTrigger>
                        <SelectContent>
                          {JOURNAL_OPTIONS.map((journal) => (
                            <SelectItem key={journal.title} value={journal.title}>
                              {journal.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Article Type *</Label>
                      <Select
                        value={formData.articleType}
                        onValueChange={(value) => handleSelectChange("articleType", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select article type" />
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
                      <Label htmlFor="journalType">Journal Category *</Label>
                      <Input
                        id="journalType"
                        value={formData.journalType}
                        placeholder="Select a journal to auto-fill category"
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="wordCount">
                      Word Count <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="wordCount"
                      name="wordCount"
                      type="number"
                      placeholder="e.g. 3500"
                      value={formData.wordCount}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="image">Cover Image (600x400px)</Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="cursor-pointer"
                    />
                    {formData.image && (
                      <p className="text-sm text-muted-foreground">
                        Selected: {formData.image.name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="file">Upload File</Label>
                    <Input
                      id="file"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                    />
                    {formData.file && (
                      <p className="text-sm text-muted-foreground">
                        Selected: {formData.file.name}
                      </p>
                    )}
                  </div>

                  <Button type="submit" className="w-full md:w-auto">
                    <Send className="w-4 h-4 mr-2" />
                    Submit for Review
                  </Button>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="track" className="space-y-6">
              <div className="bg-card border border-border rounded-lg p-6 md:p-8">
                <h2 className="font-serif text-xl font-semibold text-heading mb-6">
                  Your Submissions
                </h2>

                {userSubmissions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Article Type</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userSubmissions.map((submission) => (
                          <TableRow key={submission.id}>
                            <TableCell className="font-mono text-sm">
                              {submission.id}
                            </TableCell>
                            <TableCell>{submission.articleType}</TableCell>
                            <TableCell>{submission.submittedDate}</TableCell>
                            <TableCell>
                              <StatusBadge status={submission.status} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      No submissions yet. Submit your first research paper!
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default UserDashboard;
