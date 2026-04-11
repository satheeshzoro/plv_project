import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FileText,
  Image,
  LogOut,
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
    updateSubmissionStatus,
    settings,
    addCarouselImage,
    removeCarouselImage,
    getEditorStats,
  } = useAppData();

  const [newCarouselUrl, setNewCarouselUrl] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  if (isAuthChecking) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (isAdminLoggedIn) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (!currentEditor) {
    return <Navigate to="/login" replace />;
  }

  const editorStats = getEditorStats(currentEditor.id);
  const myTasks = submissions.filter((s) => s.assignedTo === currentEditor.id);

  const handleLogout = () => {
    logoutEditor();
    navigate("/login");
  };

  const handleUpdateStatus = (submissionId, status) => {
    updateSubmissionStatus(submissionId, status);
    setSelectedSubmission(null);
    toast({ title: `Status updated to ${status}` });
  };

  const handleAddCarouselImage = () => {
    if (!newCarouselUrl) return;
    addCarouselImage(newCarouselUrl);
    setNewCarouselUrl("");
    toast({ title: "Carousel image added!" });
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
            <TabsTrigger value="carousel" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Image className="w-4 h-4 mr-2" />
              Carousel
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
                <Button variant="outline" onClick={() => document.querySelector('[value="carousel"]')?.click()}>
                  <Image className="w-4 h-4 mr-2" />
                  Manage Carousel
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

          {/* Carousel Tab */}
          <TabsContent value="carousel">
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="font-serif text-xl font-semibold mb-6">Carousel Management</h2>

              <div className="flex gap-4 mb-6">
                <Input
                  placeholder="Enter image URL"
                  value={newCarouselUrl}
                  onChange={(e) => setNewCarouselUrl(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleAddCarouselImage}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add
                </Button>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {settings.carouselImages.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Carousel ${index + 1}`}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => {
                        removeCarouselImage(index);
                        toast({ title: "Image removed" });
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default EditorDashboard;
