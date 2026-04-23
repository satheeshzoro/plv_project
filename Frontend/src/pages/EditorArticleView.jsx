import { Navigate, useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { ArrowLeft, CheckCircle, XCircle, Download, FileText, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAppData } from "@/context/AppDataContext";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";

const EditorArticleView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { submissions, updateSubmissionStatus, currentEditor, isAdminLoggedIn, logoutEditor } = useAppData();
  const [editorReport, setEditorReport] = useState("");

  const submission = submissions.find((s) => s.id === parseInt(id));

  // Helper to ensure media URL is correct if backend sends relative path
  const getFullUrl = (url) => {
    if (!url) return null;
    if (url.startsWith("http")) return url;
    // If it starts with /articles, it might be missing /media prefix if backend isn't configured right
    // But standard Django setup with serializer context returns full URL.
    // If we are getting relative paths, we might need to prepend backend URL.
    const backend = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
    // Check if it already has /media
    if (url.startsWith("/media")) return `${backend}${url}`;
    
    // If it doesn't have /media, assume it needs it (standard Django setup)
    // But check if it already starts with /articles (your upload_to path)
    const path = url.startsWith("/") ? url : `/${url}`;
    return `${backend}/media${path}`;
  };

  if (isAdminLoggedIn) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (!currentEditor) {
    return <Navigate to="/" replace />;
  }

  if (!submission) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading article details...</p>
      </div>
    );
  }

  const handleStatusUpdate = async (status) => {
    if (!editorReport.trim()) {
      toast({
        title: "Review Report Required",
        description: "Please add your editor report before submitting the review.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateSubmissionStatus(submission.id, status, {
        editor_report: editorReport.trim(),
      });
      toast({
        title: status === "COMPLETED" ? "Article Accepted" : "Article Rejected",
        description: `The submission has been marked as ${status.toLowerCase()}.`,
      });
      navigate("/editor/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar
        isLoggedIn={true}
        user={currentEditor}
        onSignOut={() => {
          logoutEditor();
          navigate("/");
        }}
      />

      <main className="container py-8 md:py-12 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/editor/dashboard")}
          className="mb-6 pl-0 hover:pl-2 transition-all"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
          {/* Cover Image */}
          {submission.image && (
            <div className="w-full h-64 md:h-80 bg-secondary/20">
              <img
                src={getFullUrl(submission.image)}
                alt="Article Cover"
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          )}

          <div className="p-6 md:p-10 space-y-8">
            {/* Header Info */}
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-3 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full">
                  {submission.journalType}
                </span>
                <span className="px-3 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-full">
                  {submission.articleType}
                </span>
              </div>
              <h1 className="font-serif text-3xl md:text-4xl font-bold text-heading mb-4">
                {submission.fileName?.replace(/\.[^/.]+$/, "") || "Untitled Submission"}
              </h1>
              <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{submission.fullName} ({submission.email})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Submitted: {submission.submittedDate}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="editor-report">Editor Review Report</Label>
              <Textarea
                id="editor-report"
                value={editorReport}
                onChange={(e) => setEditorReport(e.target.value)}
                placeholder="Summarize the review decision, revision concerns, and recommendation for admin."
                className="min-h-40"
              />
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border">
              <Button className="flex-1" size="lg" onClick={() => handleStatusUpdate("COMPLETED")}>
                <CheckCircle className="w-5 h-5 mr-2" />
                Accept Article
              </Button>
              <Button variant="destructive" className="flex-1" size="lg" onClick={() => handleStatusUpdate("REJECTED")}>
                <XCircle className="w-5 h-5 mr-2" />
                Reject Article
              </Button>
              <Button variant="outline" className="flex-1" size="lg" asChild>
                <a href={getFullUrl(submission.fileUrl)} target="_blank" rel="noopener noreferrer">
                  <Download className="w-5 h-5 mr-2" />
                  View Manuscript
                </a>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EditorArticleView;
