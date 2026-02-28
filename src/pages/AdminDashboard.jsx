import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  Image,
  Settings,
  LogOut,
  Plus,
  Trash2,
  UserPlus,
  Edit,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAppData } from "@/context/AppDataContext";

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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    isAdminLoggedIn,
    logoutAdmin,
    adminUser,
    isAuthChecking,
    editors,
    addEditor,
    deleteEditor,
    journals,
    addJournal,
    deleteJournal,
    submissions,
    assignSubmission,
    publishSubmission,
    settings,
    updateSettings,
    addCarouselImage,
    removeCarouselImage,
    getStats,
  } = useAppData();

  const [newEditor, setNewEditor] = useState({ name: "", email: "", penName: "", country: "" });
  const [newJournal, setNewJournal] = useState({ title: "", author: "", category: "" });
  const [newCarouselUrl, setNewCarouselUrl] = useState("");
  const [editingSettings, setEditingSettings] = useState(settings);
  const [isEditorDialogOpen, setIsEditorDialogOpen] = useState(false);
  const [isJournalDialogOpen, setIsJournalDialogOpen] = useState(false);

  if (isAuthChecking) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Redirect if not logged in
  if (!isAdminLoggedIn) {
    navigate("/admin");
    return null;
  }

  const stats = getStats();

  const handleLogout = () => {
    logoutAdmin();
    navigate("/admin");
  };

  const handleAddEditor = () => {
    if (!newEditor.name || !newEditor.email) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }
    addEditor({ ...newEditor, password: "editor123" });
    setNewEditor({ name: "", email: "", penName: "", country: "" });
    setIsEditorDialogOpen(false);
    toast({ title: "Editor added successfully!" });
  };

  const handleAddJournal = () => {
    if (!newJournal.title || !newJournal.author) {
      toast({ title: "Please fill required fields", variant: "destructive" });
      return;
    }
    addJournal({
      ...newJournal,
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=400&fit=crop",
      excerpt: "New journal entry",
    });
    setNewJournal({ title: "", author: "", category: "" });
    setIsJournalDialogOpen(false);
    toast({ title: "Journal added successfully!" });
  };

  const handleAddCarouselImage = () => {
    if (!newCarouselUrl) return;
    addCarouselImage(newCarouselUrl);
    setNewCarouselUrl("");
    toast({ title: "Carousel image added!" });
  };

  const handleSaveSettings = () => {
    updateSettings(editingSettings);
    toast({ title: "Settings saved successfully!" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <span className="font-serif text-2xl font-bold text-primary">AJ</span>
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
            <TabsTrigger value="journals" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <BookOpen className="w-4 h-4 mr-2" />
              Journals
            </TabsTrigger>
            <TabsTrigger value="submissions" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <FileText className="w-4 h-4 mr-2" />
              Submissions
            </TabsTrigger>
            <TabsTrigger value="carousel" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Image className="w-4 h-4 mr-2" />
              Carousel
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              <Settings className="w-4 h-4 mr-2" />
              Settings
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
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-xl font-semibold">Manage Editors</h2>
                <Dialog open={isEditorDialogOpen} onOpenChange={setIsEditorDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Editor
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Editor</DialogTitle>
                      <DialogDescription>Enter the editor details below.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label>Name *</Label>
                        <Input
                          value={newEditor.name}
                          onChange={(e) => setNewEditor({ ...newEditor, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Email *</Label>
                        <Input
                          type="email"
                          value={newEditor.email}
                          onChange={(e) => setNewEditor({ ...newEditor, email: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Pen Name</Label>
                        <Input
                          value={newEditor.penName}
                          onChange={(e) => setNewEditor({ ...newEditor, penName: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Country</Label>
                        <Input
                          value={newEditor.country}
                          onChange={(e) => setNewEditor({ ...newEditor, country: e.target.value })}
                        />
                      </div>
                      <Button onClick={handleAddEditor} className="w-full">Add Editor</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Pen Name</TableHead>
                    <TableHead>Country</TableHead>
                    <TableHead>Actions</TableHead>
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            deleteEditor(editor.id);
                            toast({ title: "Editor deleted" });
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Journals Tab */}
          <TabsContent value="journals">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-serif text-xl font-semibold">Manage Journals</h2>
                <Dialog open={isJournalDialogOpen} onOpenChange={setIsJournalDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Journal
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add New Journal</DialogTitle>
                      <DialogDescription>Enter the journal details below.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Label>Title *</Label>
                        <Input
                          value={newJournal.title}
                          onChange={(e) => setNewJournal({ ...newJournal, title: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Author *</Label>
                        <Input
                          value={newJournal.author}
                          onChange={(e) => setNewJournal({ ...newJournal, author: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Category</Label>
                        <Input
                          value={newJournal.category}
                          onChange={(e) => setNewJournal({ ...newJournal, category: e.target.value })}
                        />
                      </div>
                      <Button onClick={handleAddJournal} className="w-full">Add Journal</Button>
                    </div>
                  </DialogContent>
                </Dialog>
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
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            deleteJournal(journal.id);
                            toast({ title: "Journal deleted" });
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
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
                        <TableCell>
                          <div className="flex gap-2">
                            {sub.status === "Pending" && (
                              <Select onValueChange={(editorId) => {
                                assignSubmission(sub.id, editorId);
                                toast({ title: "Editor assigned!" });
                              }}>
                                <SelectTrigger className="w-32">
                                  <SelectValue placeholder="Assign" />
                                </SelectTrigger>
                                <SelectContent>
                                  {editors.map((editor) => (
                                    <SelectItem key={editor.id} value={editor.id}>
                                      {editor.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
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

              <Button onClick={handleSaveSettings} className="w-full sm:w-auto">
                Save Settings
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminDashboard;
