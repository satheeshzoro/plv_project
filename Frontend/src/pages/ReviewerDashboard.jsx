import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  LogOut,
  ClipboardCheck,
  Newspaper,
  LineChart as LineChartIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useToast } from "@/hooks/use-toast";
import { useAppData } from "@/context/AppDataContext";
import logoImage from "../../assets/logo.png";
import mainImage from "../../assets/main.png";

const SCORE_OPTIONS = [
  { value: "EXCELLENT", label: "Excellent" },
  { value: "GOOD", label: "Good" },
  { value: "FAIR", label: "Fair" },
];

const emptyForm = {
  reviewer_name: "",
  clarity_of_writing: "GOOD",
  relevance_to_scope: "GOOD",
  depth_of_research: "GOOD",
  discussion_of_research: "GOOD",
  use_of_references: "GOOD",
  structure_and_organization: "GOOD",
  contribution_to_field: "GOOD",
  recommend_for_publication: true,
  comments_and_feedback: "",
  reviewer_decision: "",
};

const ReviewerDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    currentReviewer,
    isAdminLoggedIn,
    isAuthChecking,
    logoutReviewer,
    submissions,
    submitReviewerReport,
    recentPublished,
    dashboardAnalytics,
    fetchDashboardAnalytics,
    fetchSubmissions,
  } = useAppData();

  const [analyticsFilters, setAnalyticsFilters] = useState({
    year: String(new Date().getFullYear()),
    month: "all",
  });
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);
  const [reviewForm, setReviewForm] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const myTasks = useMemo(
    () => submissions.filter((s) => Number(s.reviewerAssignedTo) === Number(currentReviewer?.id)),
    [submissions, currentReviewer?.id],
  );

  const myPublished = useMemo(
    () => recentPublished.filter((item) => item.author_email === currentReviewer?.email),
    [recentPublished, currentReviewer?.email],
  );

  const pendingTasks = myTasks.filter((task) => task.status === "Under Reviewer Review").length;
  const submittedReports = myTasks.filter((task) => task.status === "Reviewer Completed").length;

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  useEffect(() => {
    fetchDashboardAnalytics({
      year: Number(analyticsFilters.year),
      month: analyticsFilters.month === "all" ? undefined : Number(analyticsFilters.month),
    }).catch(() => {});
  }, [analyticsFilters, fetchDashboardAnalytics]);

  if (isAuthChecking) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (isAdminLoggedIn) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (!currentReviewer) {
    return <Navigate to="/editor/login" replace />;
  }

  const selectedSubmission = myTasks.find((task) => task.id === selectedSubmissionId) || null;

  const handleSubmitReview = async () => {
    if (!selectedSubmission) return;
    if (!reviewForm.comments_and_feedback.trim() || !reviewForm.reviewer_decision.trim()) {
      toast({
        title: "Review form incomplete",
        description: "Please provide comments and reviewer decision.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitReviewerReport(selectedSubmission.id, {
        ...reviewForm,
        reviewer_name: reviewForm.reviewer_name || currentReviewer.name,
      });
      toast({ title: "Review submitted", description: "Editor can now review your report." });
      setSelectedSubmissionId(null);
      setReviewForm(emptyForm);
    } catch (error) {
      toast({
        title: "Failed to submit review",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="dashboard-shell">
      <header className="brand-topbar sticky top-0 z-50 border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <span className="brand-logo-mark">
              <img src={logoImage} alt="QuiLive logo" className="h-8 w-8 object-contain" />
            </span>
            <span className="text-muted-foreground">Reviewer Panel</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Welcome, {currentReviewer.name}</span>
            <Button variant="ghost" onClick={() => { logoutReviewer(); navigate("/"); }} className="text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <section className="role-hero mb-8 grid gap-8 p-6 md:grid-cols-[1.1fr_0.9fr] md:p-8">
          <div className="relative z-10">
            <span className="brand-badge">Reviewer Workspace</span>
            <h1 className="mt-5 font-serif text-4xl font-semibold text-heading md:text-5xl">
              Evaluate assigned manuscripts and submit structured review reports.
            </h1>
          </div>
          <div className="brand-image-frame p-4">
            <img src={mainImage} alt="Reviewer workspace" className="w-full object-contain" />
          </div>
        </section>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="flex flex-wrap gap-2 h-auto bg-transparent p-0">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="tasks" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="w-4 h-4 mr-2" />
              My Tasks
            </TabsTrigger>
            <TabsTrigger value="recent" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Newspaper className="w-4 h-4 mr-2" />
              Recent Published
            </TabsTrigger>
            <TabsTrigger value="statistics" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <LineChartIcon className="w-4 h-4 mr-2" />
              Statistics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <p className="text-sm text-muted-foreground">Assigned Tasks</p>
                <p className="text-3xl font-bold text-heading mt-1">{myTasks.length}</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <p className="text-sm text-muted-foreground">Pending Reviews</p>
                <p className="text-3xl font-bold text-heading mt-1">{pendingTasks}</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <p className="text-sm text-muted-foreground">Submitted Reports</p>
                <p className="text-3xl font-bold text-heading mt-1">{submittedReports}</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="tasks">
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="font-serif text-xl font-semibold mb-6">Assigned Submissions</h2>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Journal</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myTasks.map((task) => (
                      <TableRow key={task.id}>
                        <TableCell>{task.id}</TableCell>
                        <TableCell>{task.fullName}</TableCell>
                        <TableCell>{task.journalName || "-"}</TableCell>
                        <TableCell>{task.status}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={task.status !== "Under Reviewer Review"}
                            onClick={() => {
                              setSelectedSubmissionId(task.id);
                              setReviewForm({
                                ...emptyForm,
                                reviewer_name: currentReviewer.name || "",
                              });
                            }}
                          >
                            <ClipboardCheck className="w-4 h-4 mr-2" />
                            Fill Review Form
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {myTasks.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">No reviewer tasks assigned yet.</TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </div>

              {selectedSubmission ? (
                <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                  <h3 className="font-serif text-lg font-semibold">Journal Review Form - #{selectedSubmission.id}</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Reviewer Name</Label>
                      <Input
                        value={reviewForm.reviewer_name}
                        onChange={(e) => setReviewForm((prev) => ({ ...prev, reviewer_name: e.target.value }))}
                      />
                    </div>
                    {[
                      ["clarity_of_writing", "Clarity of Writing"],
                      ["relevance_to_scope", "Relevance to Scope"],
                      ["depth_of_research", "Depth of Research"],
                      ["discussion_of_research", "Discussion of Research"],
                      ["use_of_references", "Use of References"],
                      ["structure_and_organization", "Structure and Organization"],
                      ["contribution_to_field", "Contribution to Field"],
                    ].map(([field, label]) => (
                      <div key={field} className="space-y-2">
                        <Label>{label}</Label>
                        <Select
                          value={reviewForm[field]}
                          onValueChange={(value) => setReviewForm((prev) => ({ ...prev, [field]: value }))}
                        >
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {SCORE_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                    <div className="space-y-2">
                      <Label>Recommend For Publication</Label>
                      <Select
                        value={reviewForm.recommend_for_publication ? "yes" : "no"}
                        onValueChange={(value) => setReviewForm((prev) => ({ ...prev, recommend_for_publication: value === "yes" }))}
                      >
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Comments and Feedback</Label>
                    <Textarea
                      className="min-h-36"
                      value={reviewForm.comments_and_feedback}
                      onChange={(e) => setReviewForm((prev) => ({ ...prev, comments_and_feedback: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Reviewer Decision</Label>
                    <Textarea
                      className="min-h-24"
                      value={reviewForm.reviewer_decision}
                      onChange={(e) => setReviewForm((prev) => ({ ...prev, reviewer_decision: e.target.value }))}
                    />
                  </div>
                  <Button onClick={handleSubmitReview} disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : "Submit Reviewer Report"}
                  </Button>
                </div>
              ) : null}
            </div>
          </TabsContent>

          <TabsContent value="recent">
            <div className="bg-card border border-border rounded-lg p-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Article</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Journal</TableHead>
                    <TableHead>Published Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myPublished.map((item) => (
                    <TableRow key={item.article_id}>
                      <TableCell>{item.article_title}</TableCell>
                      <TableCell>{item.author_name}</TableCell>
                      <TableCell>{item.journal_name}</TableCell>
                      <TableCell>{item.published_date || "-"}</TableCell>
                    </TableRow>
                  ))}
                  {myPublished.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">No recently published items found.</TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="statistics">
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <Label>Year</Label>
                    <Input
                      type="number"
                      value={analyticsFilters.year}
                      onChange={(e) => setAnalyticsFilters((prev) => ({ ...prev, year: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Month</Label>
                    <Select
                      value={analyticsFilters.month}
                      onValueChange={(value) => setAnalyticsFilters((prev) => ({ ...prev, month: value }))}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Months</SelectItem>
                        {Array.from({ length: 12 }, (_, idx) => idx + 1).map((month) => (
                          <SelectItem key={month} value={String(month)}>{month}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Visitors</p>
                    <p className="text-xl font-semibold">{dashboardAnalytics?.visitors_count ?? 0}</p>
                  </div>
                  <div className="bg-card border border-border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">Submissions</p>
                    <p className="text-xl font-semibold">{dashboardAnalytics?.submissions_count ?? 0}</p>
                  </div>
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-serif text-lg font-semibold mb-4">Submissions Trend</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={dashboardAnalytics?.submissions_trend || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis allowDecimals={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#0f766e" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ReviewerDashboard;
