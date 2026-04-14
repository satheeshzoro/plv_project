import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Clock, CheckCircle, AlertCircle, Newspaper } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAppData } from "@/context/AppDataContext";
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
  const { submissions, currentUser, logoutUser, isAuthChecking, recentPublished } = useAppData();

  if (isAuthChecking) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!currentUser) {
    return <Navigate to="/" replace />;
  }

  const userSubmissions = submissions.filter((s) => s.email === currentUser?.email);

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
                Track submission status and discover recent publications.
              </h1>
              <p className="mt-4 max-w-2xl text-muted-foreground">
                Monitor every decision from submission to publication and stay up to date with newly published articles.
              </p>
            </div>
            <div className="brand-image-frame p-4">
              <img src={mainImage} alt="Author submission workspace" className="w-full object-contain" />
            </div>
          </section>

          <Tabs defaultValue="track" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-xl">
              <TabsTrigger value="track" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Submission Status
              </TabsTrigger>
              <TabsTrigger value="recent" className="flex items-center gap-2">
                <Newspaper className="w-4 h-4" />
                Recent Published
              </TabsTrigger>
            </TabsList>

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
                          <TableHead>Journal</TableHead>
                          <TableHead>Submitted</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {userSubmissions.map((submission) => (
                          <TableRow key={submission.id}>
                            <TableCell className="font-mono text-sm">{submission.id}</TableCell>
                            <TableCell>{submission.articleType}</TableCell>
                            <TableCell>{submission.journalName || "-"}</TableCell>
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
                      No submissions yet. Use Submit Manuscript from the navbar to begin.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="recent" className="space-y-6">
              <div className="bg-card border border-border rounded-lg p-6 md:p-8">
                <h2 className="font-serif text-xl font-semibold text-heading mb-6">
                  Recently Published Articles
                </h2>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User Name</TableHead>
                        <TableHead>Article</TableHead>
                        <TableHead>Journal</TableHead>
                        <TableHead>Published On</TableHead>
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
                            No recent published articles yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
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
