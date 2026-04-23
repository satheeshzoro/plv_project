import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  Settings,
  LogOut,
  Trash2,
  Archive,
  Undo2,
  UserPlus,
  Upload,
  LineChart as LineChartIcon,
  Newspaper,
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
import { resolveBackendUrl } from "@/lib/api";
import { ARTICLE_TYPES, JOURNAL_CATEGORY_BY_TITLE, JOURNAL_OPTIONS } from "@/data/journalOptions";
import logoImage from "../../assets/logo.png";
import mainImage from "../../assets/main.png";

const StatCard = ({ title, value, icon: Icon }) => (
  <div className="bg-card border border-border rounded-lg p-6">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-3xl font-bold text-heading mt-1">{value}</p>
      </div>
      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
        <Icon className="w-6 h-6 text-primary" />
      </div>
    </div>
  </div>
);

const JOURNAL_NOTIFICATION_TITLES = [
  "Journal of Clinical Sciences Research",
  "Journal of Pharmaceutical Sciences Drug Technology",
  "Biochemistry & Physiology Journal",
  "Paediatrics & Childhood Obesity",
  "Health Care Research & Case Reports Journal",
  "Journal of Molecular Biology & Infectious Diseases",
  "Food & Nutritional Sciences Journal",
  "Genetics & Biotechnology Journal",
  "Neurological & Psychological Journal",
  "Journal of Gynaecology & Obstetrics",
];

const JOURNAL_CATEGORY_OPTIONS = [
  "Medical Sciences",
  "Biotechnology",
  "Environmental Science",
];

const BACKEND_URL = resolveBackendUrl();

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    isAdminLoggedIn,
    logoutAdmin,
    adminUser,
    isAuthChecking,
    editors,
    users,
    promoteUserToEditor,
    updateEditorJournalCategory,
    journals,
    archivedJournals,
    submissions,
    assignSubmission,
    publishSubmission,
    adminPublishArticle,
    archiveJournal,
    unarchiveJournal,
    deleteJournal,
    settings,
    updateSettings,
    getStats,
    recentPublished,
    dashboardAnalytics,
    fetchDashboardAnalytics,
  } = useAppData();

  const [editingSettings, setEditingSettings] = useState(settings);
  const [isPublishingArticle, setIsPublishingArticle] = useState(false);
  const [publishFile, setPublishFile] = useState(null);
  const [publishImage, setPublishImage] = useState(null);
  const [publishImagePreview, setPublishImagePreview] = useState(null);
  const [publishForm, setPublishForm] = useState({
    title: "",
    authorName: "",
    authorEmail: "",
    journalName: "",
    journalType: "",
    articleType: "",
    wordCount: "",
  });
  const [analyticsFilters, setAnalyticsFilters] = useState({
    year: String(new Date().getFullYear()),
    month: "all",
  });

  useEffect(() => {
    setEditingSettings(settings);
  }, [settings]);

  useEffect(() => {
    fetchDashboardAnalytics({
      year: Number(analyticsFilters.year),
      month: analyticsFilters.month === "all" ? undefined : Number(analyticsFilters.month),
    }).catch((error) => {
      console.error("Failed to fetch analytics:", error);
    });
  }, [analyticsFilters, fetchDashboardAnalytics]);

  if (isAuthChecking) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAdminLoggedIn) {
    return <Navigate to="/" replace />;
  }

  const stats = getStats();

  const handleLogout = () => {
    logoutAdmin();
    navigate("/");
  };

  const handleSaveSettings = () => {
    updateSettings(editingSettings);
    toast({ title: "Settings saved successfully!" });
  };

  const handlePublishFormChange = (field, value) => {
    if (field === "journalName") {
      setPublishForm((prev) => ({
        ...prev,
        journalName: value,
        journalType: JOURNAL_CATEGORY_BY_TITLE[value] || "",
      }));
      return;
    }
    setPublishForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleDirectPublish = async (e) => {
    e.preventDefault();
    if (
      !publishForm.title ||
      !publishForm.authorName ||
      !publishForm.authorEmail ||
      !publishForm.journalName ||
      !publishForm.journalType ||
      !publishForm.articleType ||
      !publishForm.wordCount ||
      !publishFile ||
      !publishImage
    ) {
      toast({
        title: "Incomplete form",
        description: "Please fill all required fields and upload both image and manuscript file.",
        variant: "destructive",
      });
      return;
    }

    setIsPublishingArticle(true);
    try {
      const formData = new FormData();
      formData.append("title", publishForm.title.trim());
      formData.append("author_name", publishForm.authorName.trim());
      formData.append("author_email", publishForm.authorEmail.trim().toLowerCase());
      formData.append("journal_name", publishForm.journalName);
      formData.append("category", publishForm.journalType);
      formData.append("article_type", publishForm.articleType);
      formData.append("word_count", publishForm.wordCount);
      formData.append("file", publishFile);
      formData.append("image", publishImage);

      await adminPublishArticle(formData);

      setPublishForm({
        title: "",
        authorName: "",
        authorEmail: "",
        journalName: "",
        journalType: "",
        articleType: "",
        wordCount: "",
      });
      setPublishFile(null);
      setPublishImage(null);
      setPublishImagePreview(null);

      toast({ title: "Article published successfully" });
    } catch (error) {
      toast({
        title: "Publishing failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsPublishingArticle(false);
    }
  };

  const getSubmissionFileUrl = (fileUrl) => {
    if (!fileUrl) return "";
    if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
      return fileUrl;
    }
    return `${BACKEND_URL}${fileUrl.startsWith("/") ? fileUrl : `/${fileUrl}`}`;
  };

  return (
    <div className="dashboard-shell">
      {/* Header */}
      <header className="brand-topbar sticky top-0 z-50 border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <span className="brand-logo-mark">
              <img src={logoImage} alt="QuiLive logo" className="h-8 w-8 object-contain" />
            </span>
            <span className="text-muted-foreground">
              Admin Dashboard <span className="hidden sm:inline mx-2">•</span> Welcome, {adminUser?.name || adminUser?.full_name || "Admin"}
            </span>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-destructive">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container py-8">
        <section className="role-hero mb-8 grid gap-8 p-6 md:grid-cols-[1.1fr_0.9fr] md:p-8">
          <div className="relative z-10">
            <span className="brand-badge">Administrator Workspace</span>
            <h1 className="mt-5 font-serif text-4xl font-semibold text-heading md:text-5xl">
              Manage people, review flow, and publication decisions in one place.
            </h1>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Welcome, {adminUser?.name || adminUser?.full_name || "Admin"}. Track submissions, assign editors, promote users, and move accepted work into publication.
            </p>
          </div>
          <div className="brand-image-frame p-4">
            <img src={mainImage} alt="Admin publishing workspace" className="w-full object-contain" />
          </div>
        </section>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="flex flex-wrap gap-2 h-auto bg-transparent p-0">
            <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="editors" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Users className="w-4 h-4 mr-2" />
              Editors
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <UserPlus className="w-4 h-4 mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="journals" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BookOpen className="w-4 h-4 mr-2" />
              Journals
            </TabsTrigger>
            <TabsTrigger value="archived" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Archive className="w-4 h-4 mr-2" />
              Archived
            </TabsTrigger>
            <TabsTrigger value="submissions" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="w-4 h-4 mr-2" />
              Submissions
            </TabsTrigger>
            <TabsTrigger value="direct-publish" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Upload className="w-4 h-4 mr-2" />
              Direct Publish
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Settings className="w-4 h-4 mr-2" />
              Settings
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
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard title="Total Journals" value={stats.totalJournals} icon={BookOpen} />
              <StatCard title="Registered Users" value={stats.registeredUsers} icon={Users} />
              <StatCard title="Active Editors" value={stats.activeEditors} icon={UserPlus} />
              <StatCard title="Pending Reviews" value={stats.pendingReviews} icon={FileText} />
            </div>
          </TabsContent>

          {/* Editors Tab */}
          <TabsContent value="editors">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="mb-6">
                <h2 className="font-serif text-xl font-semibold">Active Editors</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Editors can log in from the common sign-in page and are redirected automatically based on role.
                </p>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Pen Name</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Mapped Category</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {editors.map((editor) => (
                    <TableRow key={editor.id}>
                      <TableCell className="font-medium">{editor.name}</TableCell>
                      <TableCell>{editor.email}</TableCell>
                      <TableCell>{editor.penName || "-"}</TableCell>
                      <TableCell>{editor.country || "-"}</TableCell>
                      <TableCell>
                        <Select
                          value={editor.mappedJournalCategory || "unassigned"}
                          onValueChange={async (value) => {
                            try {
                              await updateEditorJournalCategory(
                                editor.id,
                                value === "unassigned" ? "" : value,
                              );
                              toast({ title: "Editor category updated" });
                            } catch (error) {
                              toast({
                                title: "Failed to update editor category",
                                description: error.message,
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          <SelectTrigger className="w-52">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="unassigned">Unassigned</SelectItem>
                            {JOURNAL_CATEGORY_OPTIONS.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="users">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="mb-6">
                <h2 className="font-serif text-xl font-semibold">Registered Users</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  New registrations stay as `USER` by default. Only admin can grant editor access.
                </p>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={async () => {
                            try {
                              await promoteUserToEditor(user.id);
                              toast({ title: "Editor access granted" });
                            } catch (error) {
                              toast({
                                title: "Failed to grant editor access",
                                description: error.message,
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          Grant Editor Access
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {users.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No registered users are waiting for promotion.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Journals Tab */}
          <TabsContent value="journals">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-xl font-semibold">Published Journals</h2>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {journals.map((journal) => (
                    <TableRow key={journal.id}>
                      <TableCell className="font-medium max-w-xs truncate">{journal.title}</TableCell>
                      <TableCell>{journal.author}</TableCell>
                      <TableCell>{journal.category}</TableCell>
                      <TableCell>{journal.publishedDate}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              const confirmed = window.confirm(
                                `Archive "${journal.title}"? It will be hidden from users.`
                              );
                              if (!confirmed) return;
                              try {
                                await archiveJournal(journal.id);
                                toast({ title: "Journal archived" });
                              } catch (error) {
                                toast({
                                  title: "Archive failed",
                                  description: error.message,
                                  variant: "destructive",
                                });
                              }
                            }}
                          >
                            <Archive className="w-4 h-4 mr-2" />
                            Archive
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={async () => {
                              const confirmed = window.confirm(
                                `Delete "${journal.title}" permanently? This cannot be undone.`
                              );
                              if (!confirmed) return;
                              try {
                                await deleteJournal(journal.id);
                                toast({ title: "Journal deleted" });
                              } catch (error) {
                                toast({
                                  title: "Delete failed",
                                  description: error.message,
                                  variant: "destructive",
                                });
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {journals.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No published journals available.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="archived">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-xl font-semibold">Archived Journals</h2>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Published</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {archivedJournals.map((journal) => (
                    <TableRow key={journal.id}>
                      <TableCell className="font-medium max-w-xs truncate">{journal.title}</TableCell>
                      <TableCell>{journal.author}</TableCell>
                      <TableCell>{journal.category}</TableCell>
                      <TableCell>{journal.publishedDate || "-"}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              try {
                                await unarchiveJournal(journal.id);
                                toast({ title: "Journal unarchived" });
                              } catch (error) {
                                toast({
                                  title: "Unarchive failed",
                                  description: error.message,
                                  variant: "destructive",
                                });
                              }
                            }}
                          >
                            <Undo2 className="w-4 h-4 mr-2" />
                            Unarchive
                          </Button>

                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={async () => {
                              const confirmed = window.confirm(
                                `Delete "${journal.title}" permanently? This cannot be undone.`
                              );
                              if (!confirmed) return;
                              try {
                                await deleteJournal(journal.id);
                                toast({ title: "Journal deleted" });
                              } catch (error) {
                                toast({
                                  title: "Delete failed",
                                  description: error.message,
                                  variant: "destructive",
                                });
                              }
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {archivedJournals.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No archived journals available.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Submissions Tab */}
          <TabsContent value="submissions">
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="font-serif text-xl font-semibold mb-6">Submission Workflow</h2>

              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Article Type</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Editor Report</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {submissions.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell className="font-mono text-sm">{sub.id}</TableCell>
                        <TableCell>{sub.fullName}</TableCell>
                        <TableCell>{sub.email}</TableCell>
                        <TableCell>{sub.articleType}</TableCell>
                        <TableCell>{sub.submittedDate}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            sub.status === "Pending" ? "bg-yellow-100 text-yellow-800" :
                            sub.status === "Under Review" ? "bg-blue-100 text-blue-800" :
                            sub.status === "Completed" ? "bg-green-100 text-green-800" :
                            sub.status === "Published" ? "bg-emerald-100 text-emerald-800" :
                            "bg-gray-100 text-gray-800"
                          }`}>
                            {sub.status}
                          </span>
                        </TableCell>
                        <TableCell>
                          {sub.assignedTo ? editors.find(e => e.id === sub.assignedTo)?.name || "-" : "-"}
                        </TableCell>
                        <TableCell className="max-w-xs whitespace-pre-wrap text-sm text-muted-foreground">
                          {sub.editorReport || "-"}
                        </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {sub.fileUrl && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      window.open(getSubmissionFileUrl(sub.fileUrl), "_blank", "noopener,noreferrer");
                                    }}
                                  >
                                    View Article
                                  </Button>
                                  <a
                                    href={getSubmissionFileUrl(sub.fileUrl)}
                                    download={sub.fileName || `submission-${sub.id}`}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    <Button size="sm" variant="outline">
                                      Download
                                    </Button>
                                  </a>
                                </>
                              )}
                              {(sub.status === "Pending" || sub.status === "Under Review") && (
                                <Select onValueChange={async (editorId) => {
                                  const editorName = editors.find((e) => String(e.id) === String(editorId))?.name || "selected editor";
                                const confirmed = window.confirm(
                                  `Assign submission #${sub.id} to ${editorName}?`
                                );
                                if (!confirmed) return;
                                try {
                                  await assignSubmission(sub.id, editorId);
                                  toast({ title: "Editor assigned!" });
                                } catch (error) {
                                  toast({
                                    title: "Assignment failed",
                                    description: error.message,
                                    variant: "destructive",
                                  });
                                }
                              }}>
                                <SelectTrigger className="w-32">
                                  <SelectValue placeholder="Assign" />
                                </SelectTrigger>
                                <SelectContent>
                                  {editors.map((editor) => (
                                    <SelectItem key={editor.id} value={String(editor.id)}>
                                      {editor.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                            {sub.assignedTo && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={async () => {
                                  const confirmed = window.confirm(
                                    `Unassign editor from submission #${sub.id}?`
                                  );
                                  if (!confirmed) return;
                                  try {
                                    await assignSubmission(sub.id, null);
                                    toast({ title: "Editor unassigned" });
                                  } catch (error) {
                                    toast({
                                      title: "Unassign failed",
                                      description: error.message,
                                      variant: "destructive",
                                    });
                                  }
                                }}
                              >
                                Unassign
                              </Button>
                            )}
                            {sub.status === "Completed" && (
                              <Button
                                size="sm"
                                onClick={() => {
                                  publishSubmission(sub.id);
                                  toast({ title: "Article published!" });
                                }}
                              >
                                Publish
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="direct-publish">
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="font-serif text-xl font-semibold mb-2">Publish Article Directly</h2>
              <p className="text-sm text-muted-foreground mb-6">
                Upload and publish an article immediately without waiting for review workflow.
              </p>

              <form onSubmit={handleDirectPublish} className="space-y-6">
                <div className="space-y-2">
                  <Label>Article Title</Label>
                  <Input
                    value={publishForm.title}
                    onChange={(e) => handlePublishFormChange("title", e.target.value)}
                    placeholder="Enter article title"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Author Name</Label>
                    <Input
                      value={publishForm.authorName}
                      onChange={(e) => handlePublishFormChange("authorName", e.target.value)}
                      placeholder="Author full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Author Email</Label>
                    <Input
                      type="email"
                      value={publishForm.authorEmail}
                      onChange={(e) => handlePublishFormChange("authorEmail", e.target.value)}
                      placeholder="author@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2 md:col-span-2">
                    <Label>Journal Name</Label>
                    <Select
                      value={publishForm.journalName}
                      onValueChange={(value) => handlePublishFormChange("journalName", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select journal name" />
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
                    <Label>Article Type</Label>
                    <Select
                      value={publishForm.articleType}
                      onValueChange={(value) => handlePublishFormChange("articleType", value)}
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
                    <Label>Journal Category</Label>
                    <Input value={publishForm.journalType} readOnly placeholder="Auto-filled from journal" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Word Count</Label>
                  <Input
                    type="number"
                    value={publishForm.wordCount}
                    onChange={(e) => handlePublishFormChange("wordCount", e.target.value)}
                    placeholder="e.g. 2500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Cover Image</Label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const nextImage = e.target.files?.[0] || null;
                        setPublishImage(nextImage);
                        setPublishImagePreview(nextImage ? URL.createObjectURL(nextImage) : null);
                      }}
                    />
                    {publishImagePreview && (
                      <img
                        src={publishImagePreview}
                        alt="Article preview"
                        className="h-24 w-24 rounded object-cover border border-border"
                      />
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Article File (PDF/DOC/DOCX)</Label>
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                      onChange={(e) => setPublishFile(e.target.files?.[0] || null)}
                    />
                    {publishFile && (
                      <p className="text-sm text-muted-foreground truncate">{publishFile.name}</p>
                    )}
                  </div>
                </div>

                <Button type="submit" disabled={isPublishingArticle}>
                  {isPublishingArticle ? "Publishing..." : "Publish Now"}
                </Button>
              </form>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="bg-card border border-border rounded-lg p-6 space-y-8">
              <h2 className="font-serif text-xl font-semibold">Site Settings</h2>

              {/* Social Links */}
              <div className="space-y-4">
                <h3 className="font-medium text-heading">Social Links</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Instagram URL</Label>
                    <Input
                      value={editingSettings.socials?.instagram || ""}
                      onChange={(e) => setEditingSettings({
                        ...editingSettings,
                        socials: { ...editingSettings.socials, instagram: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label>LinkedIn URL</Label>
                    <Input
                      value={editingSettings.socials?.linkedin || ""}
                      onChange={(e) => setEditingSettings({
                        ...editingSettings,
                        socials: { ...editingSettings.socials, linkedin: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Twitter URL</Label>
                    <Input
                      value={editingSettings.socials?.twitter || ""}
                      onChange={(e) => setEditingSettings({
                        ...editingSettings,
                        socials: { ...editingSettings.socials, twitter: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label>WhatsApp URL</Label>
                    <Input
                      value={editingSettings.socials?.whatsapp || ""}
                      onChange={(e) => setEditingSettings({
                        ...editingSettings,
                        socials: { ...editingSettings.socials, whatsapp: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </div>

              {/* About Section */}
              <div className="space-y-4">
                <h3 className="font-medium text-heading">About Section</h3>
                <div className="space-y-4">
                  <div>
                    <Label>Title</Label>
                    <Input
                      value={editingSettings.about?.title || ""}
                      onChange={(e) => setEditingSettings({
                        ...editingSettings,
                        about: { ...editingSettings.about, title: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Description</Label>
                    <Textarea
                      value={editingSettings.about?.description || ""}
                      onChange={(e) => setEditingSettings({
                        ...editingSettings,
                        about: { ...editingSettings.about, description: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Image URL</Label>
                    <Input
                      value={editingSettings.about?.imageUrl || ""}
                      onChange={(e) => setEditingSettings({
                        ...editingSettings,
                        about: { ...editingSettings.about, imageUrl: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-4">
                <h3 className="font-medium text-heading">Contact Information</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Helpline Email</Label>
                    <Input
                      value={editingSettings.contact?.helplineEmail || ""}
                      onChange={(e) => setEditingSettings({
                        ...editingSettings,
                        contact: { ...editingSettings.contact, helplineEmail: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Helpline Number</Label>
                    <Input
                      value={editingSettings.contact?.helplineNumber || ""}
                      onChange={(e) => setEditingSettings({
                        ...editingSettings,
                        contact: { ...editingSettings.contact, helplineNumber: e.target.value }
                      })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium text-heading">Submission Notification Emails</h3>
                <div>
                  <Label>Common QuiLive Submission Email</Label>
                  <Input
                    type="email"
                    value={editingSettings.submissionNotifications?.commonEmail || ""}
                    onChange={(e) => setEditingSettings({
                      ...editingSettings,
                      submissionNotifications: {
                        ...editingSettings.submissionNotifications,
                        commonEmail: e.target.value,
                        journalEmails: editingSettings.submissionNotifications?.journalEmails || {},
                      },
                    })}
                  />
                </div>
                <div className="grid gap-4">
                  {JOURNAL_NOTIFICATION_TITLES.map((title) => (
                    <div key={title}>
                      <Label>{title}</Label>
                      <Input
                        type="email"
                        value={editingSettings.submissionNotifications?.journalEmails?.[title] || ""}
                        onChange={(e) => setEditingSettings({
                          ...editingSettings,
                          submissionNotifications: {
                            ...editingSettings.submissionNotifications,
                            commonEmail: editingSettings.submissionNotifications?.commonEmail || "",
                            journalEmails: {
                              ...(editingSettings.submissionNotifications?.journalEmails || {}),
                              [title]: e.target.value,
                            },
                          },
                        })}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <Button onClick={handleSaveSettings} className="w-full sm:w-auto">
                Save Settings
              </Button>
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
                  {recentPublished.length > 0 ? recentPublished.map((item) => (
                    <TableRow key={item.article_id}>
                      <TableCell>{item.author_name}</TableCell>
                      <TableCell className="max-w-xs truncate">{item.article_title}</TableCell>
                      <TableCell>{item.journal_name}</TableCell>
                      <TableCell>{item.published_date || "-"}</TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No recently published records found.
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
                  <StatCard title="Visitors" value={dashboardAnalytics?.visitors_count ?? 0} icon={Users} />
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

export default AdminDashboard;
