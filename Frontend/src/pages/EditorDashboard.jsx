import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  LogOut,
  CheckCircle,
  Clock,
  Newspaper,
  LineChart as LineChartIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
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

const StatCard = ({ title, value, icon: Icon, variant = "default" }) => {
  const variants = {
    default: "bg-primary/10 text-primary",
    warning: "bg-yellow-100 text-yellow-800",
    success: "bg-green-100 text-green-800",
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-heading mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${variants[variant]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

const EditorDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    currentEditor,
    isAdminLoggedIn,
    logoutEditor,
    isAuthChecking,
    submissions,
    uploadEditorProfileImage,
    getEditorStats,
    recentPublished,
    dashboardAnalytics,
    fetchDashboardAnalytics,
    fetchSubmissions,
  } = useAppData();

  const [profileImageFile, setProfileImageFile] = useState(null);
  const [isUploadingProfileImage, setIsUploadingProfileImage] = useState(false);
  const [analyticsFilters, setAnalyticsFilters] = useState({
    year: String(new Date().getFullYear()),
    month: "all",
  });

  if (isAuthChecking) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (isAdminLoggedIn) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (!currentEditor) {
    return <Navigate to="/" replace />;
  }

  if (currentEditor.requiresProfileImage) {
    return (
      <div className="dashboard-shell min-h-screen">
        <header className="brand-topbar sticky top-0 z-50 border-b border-border">
          <div className="container flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <span className="brand-logo-mark">
                <img src={logoImage} alt="QuiLive logo" className="h-8 w-8 object-contain" />
              </span>
              <span className="text-muted-foreground">Editor Panel</span>
            </div>
            <Button variant="ghost" onClick={handleLogout} className="text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </header>
        <main className="container py-10">
          <div className="mx-auto max-w-xl rounded-xl border border-border bg-card p-6 md:p-8">
            <h1 className="font-serif text-2xl font-semibold text-heading">Complete your editor profile</h1>
            <p className="mt-3 text-muted-foreground">
              Your first editor login requires a profile image before continuing.
              Upload an image between 64 x 64 and 500 x 500 pixels, at most 1.5 MB.
            </p>
            <div className="mt-6 space-y-4">
              <Input
                type="file"
                accept="image/*"
                onChange={(e) => setProfileImageFile(e.target.files?.[0] || null)}
              />
              <Button onClick={handleMandatoryProfileImageUpload} disabled={isUploadingProfileImage}>
                {isUploadingProfileImage ? "Uploading..." : "Upload And Continue"}
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  const editorStats = getEditorStats(currentEditor.id);
  const myTasks = submissions.filter((s) => Number(s.assignedTo) === Number(currentEditor.id));

  const myRecentPublished = recentPublished.filter(
    (item) => item.author_email === currentEditor.email || item.author_name === currentEditor.name,
  );

  function handleLogout() {
    logoutEditor();
    navigate("/");
  }

  function getImageDimensions(file) {
    return new Promise((resolve, reject) => {
      const imagePreview = new window.Image();
      const objectUrl = URL.createObjectURL(file);
      imagePreview.onload = () => {
        resolve({ width: imagePreview.width, height: imagePreview.height });
        URL.revokeObjectURL(objectUrl);
      };
      imagePreview.onerror = () => {
        reject(new Error("Invalid image file."));
        URL.revokeObjectURL(objectUrl);
      };
      imagePreview.src = objectUrl;
    });
  }

  async function handleMandatoryProfileImageUpload() {
    if (!profileImageFile) {
      toast({
        title: "Image required",
        description: "Please select an image between 64 x 64 and 500 x 500 pixels.",
        variant: "destructive",
      });
      return;
    }

    if (profileImageFile.size > 1.5 * 1024 * 1024) {
      toast({
        title: "Image too large",
        description: "Image size must be at most 1.5 MB.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { width, height } = await getImageDimensions(profileImageFile);
      if (width < 64 || height < 64 || width > 500 || height > 500) {
        toast({
          title: "Invalid image size",
          description: "Editor image must be between 64 x 64 and 500 x 500 pixels.",
          variant: "destructive",
        });
        return;
      }

      setIsUploadingProfileImage(true);
      await uploadEditorProfileImage(profileImageFile);
      setProfileImageFile(null);
      toast({
        title: "Profile updated",
        description: "Your editor image has been uploaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error.message || "Unable to upload profile image.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingProfileImage(false);
    }
  }

  const handleFetchAnalytics = () => {
    fetchDashboardAnalytics({
      year: Number(analyticsFilters.year),
      month: analyticsFilters.month === "all" ? undefined : Number(analyticsFilters.month),
    }).catch((error) => {
      console.error("Failed to fetch analytics:", error);
    });
  };

  useEffect(() => {
    handleFetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchSubmissions();
    const intervalId = setInterval(() => {
      fetchSubmissions();
    }, 10000);
    return () => clearInterval(intervalId);
  }, [fetchSubmissions]);

  return (
    <div className="dashboard-shell">
      {/* Header */}
      <header className="brand-topbar sticky top-0 z-50 border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <span className="brand-logo-mark">
              <img src={logoImage} alt="QuiLive logo" className="h-8 w-8 object-contain" />
            </span>
            <span className="text-muted-foreground">Editor Panel</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {currentEditor.name}
            </span>
            <Button variant="ghost" onClick={handleLogout} className="text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <section className="role-hero mb-8 grid gap-8 p-6 md:grid-cols-[1.1fr_0.9fr] md:p-8">
          <div className="relative z-10">
            <span className="brand-badge">Editorial Workspace</span>
            <h1 className="mt-5 font-serif text-4xl font-semibold text-heading md:text-5xl">
              Review assigned manuscripts and return a clear decision to admin.
            </h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Welcome, {currentEditor.name}. This panel keeps your review queue, article decisions, and homepage media controls in one place.
            </p>
          </div>
          <div className="brand-image-frame p-4">
            <img src={mainImage} alt="Editor review workspace" className="w-full object-contain" />
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
            <TabsTrigger value="recent-published" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Newspaper className="w-4 h-4 mr-2" />
              Recent Published
            </TabsTrigger>
            <TabsTrigger value="statistics" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <LineChartIcon className="w-4 h-4 mr-2" />
              Statistics
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid sm:grid-cols-3 gap-6">
              <StatCard
                title="Total Assigned"
                value={editorStats.totalAssigned}
                icon={FileText}
              />
              <StatCard
                title="Pending Review"
                value={editorStats.pendingReview}
                icon={Clock}
                variant="warning"
              />
              <StatCard
                title="Completed"
                value={editorStats.completed}
                icon={CheckCircle}
                variant="success"
              />
            </div>

            <div className="mt-8 bg-card border border-border rounded-lg p-6">
              <h2 className="font-serif text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="flex flex-wrap gap-4">
                <Button variant="outline" onClick={() => document.querySelector('[value="tasks"]')?.click()}>
                  <FileText className="w-4 h-4 mr-2" />
                  View My Tasks
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* My Tasks Tab */}
          <TabsContent value="tasks">
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="font-serif text-xl font-semibold mb-6">My Assigned Tasks</h2>

              {myTasks.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Author</TableHead>
                        <TableHead>Article Type</TableHead>
                        <TableHead>Journal Type</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {myTasks.map((task) => (
                        <TableRow key={task.id}>
                          <TableCell className="font-mono text-sm">{task.id}</TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{task.fullName}</p>
                              <p className="text-sm text-muted-foreground">{task.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>{task.articleType}</TableCell>
                          <TableCell>{task.journalType}</TableCell>
                          <TableCell>{task.submittedDate}</TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              task.status === "Under Review" ? "bg-blue-100 text-blue-800" :
                              task.status === "Completed" ? "bg-green-100 text-green-800" :
                              task.status === "Rejected" ? "bg-red-100 text-red-800" :
                              "bg-gray-100 text-gray-800"
                            }`}>
                              {task.status}
                            </span>
                          </TableCell>
                          <TableCell>
                            {task.status === "Under Review" && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => navigate(`/editor/submission/${task.id}`)}
                              >
                                Review
                              </Button>
                            )}
                            {(task.status === "Completed" || task.status === "Rejected") && (
                              <span className="text-sm text-muted-foreground">No actions</span>
                            )}
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
                    No tasks assigned to you yet.
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="recent-published">
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="font-serif text-xl font-semibold mb-6">Recently Published Articles</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User Name</TableHead>
                    <TableHead>Article</TableHead>
                    <TableHead>Journal</TableHead>
                    <TableHead>Published Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myRecentPublished.length > 0 ? myRecentPublished.map((item) => (
                    <TableRow key={item.article_id}>
                      <TableCell>{item.author_name}</TableCell>
                      <TableCell className="max-w-xs truncate">{item.article_title}</TableCell>
                      <TableCell>{item.journal_name}</TableCell>
                      <TableCell>{item.published_date || "-"}</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No recently published records found for your queue.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="statistics">
            <div className="space-y-6">
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="font-serif text-xl font-semibold mb-4">Traffic & Submission Analytics</h2>
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
                      <SelectTrigger>
                        <SelectValue placeholder="All months" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Months</SelectItem>
                        {Array.from({ length: 12 }, (_, idx) => idx + 1).map((month) => (
                          <SelectItem key={month} value={String(month)}>
                            {month}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="self-end" onClick={handleFetchAnalytics}>Apply Filters</Button>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <StatCard title="Visitors" value={dashboardAnalytics?.visitors_count ?? 0} icon={Clock} />
                  <StatCard title="Submissions" value={dashboardAnalytics?.submissions_count ?? 0} icon={FileText} />
                </div>
              </div>

              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-serif text-lg font-semibold mb-4">Submissions Trend (Month-wise)</h3>
                <div className="h-80">
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

              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-serif text-lg font-semibold mb-4">Published Article Metrics</h3>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Article</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Views</TableHead>
                      <TableHead>Downloads</TableHead>
                      <TableHead>Published</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(dashboardAnalytics?.article_metrics || []).length > 0 ? (
                      (dashboardAnalytics?.article_metrics || []).map((item) => (
                        <TableRow key={item.article_id}>
                          <TableCell className="max-w-xs truncate">{item.title}</TableCell>
                          <TableCell>{item.author_name}</TableCell>
                          <TableCell>{item.views}</TableCell>
                          <TableCell>{item.downloads}</TableCell>
                          <TableCell>{item.published_date || "-"}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No article metrics available.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default EditorDashboard;
