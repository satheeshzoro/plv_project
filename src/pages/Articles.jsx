import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ArrowLeft, Download, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAppData } from "@/context/AppDataContext";

const Articles = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { journals, currentUser, logoutUser, recordArticleDownload } = useAppData();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredArticles = journals.filter((article) =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

      <main className="py-12 md:py-16">
        <div className="container">
          {/* Back Link */}
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-smooth mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>

          {/* Page Header */}
          <div className="mb-10">
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-heading mb-4">
              All Articles
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Browse our collection of peer-reviewed articles and research papers from scholars worldwide.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-xl mb-10">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search articles by title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-6 text-base border-border bg-card"
            />
          </div>

          {/* Articles List */}
          <div className="space-y-4">
            {filteredArticles.length > 0 ? (
              filteredArticles.map((article) => (
                <div
                  key={article.id}
                  className="flex items-center justify-between p-4 md:p-6 bg-card border border-border rounded-lg hover:shadow-elegant transition-smooth"
                >
                  <div className="flex-1 min-w-0">
                    <span className="inline-block px-2 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded mb-2">
                      {article.category}
                    </span>
                    <h3 className="font-serif text-lg md:text-xl font-semibold text-heading truncate">
                      {article.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground mt-1">
                      <span>By {article.author}</span>
                      <span className="hidden sm:inline w-1 h-1 bg-muted-foreground/40 rounded-full" />
                      <span>{article.date || article.publishedDate}</span>
                      <span className="hidden sm:inline w-1 h-1 bg-muted-foreground/40 rounded-full" />
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{article.readTime}</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="ml-4 shrink-0"
                    onClick={() => {
                      recordArticleDownload(article.id);
                      toast({ title: "Download Started", description: `Downloading ${article.title}.pdf` });
                    }}
                  >
                    <Download className="mr-2 w-4 h-4" />
                    Download PDF
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  No articles found matching "{searchQuery}"
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Articles;
