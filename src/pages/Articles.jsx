import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Download,
  FileCheck,
  FileClock,
  FolderArchive,
  DownloadCloud,
  Send,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useAppData } from "@/context/AppDataContext";
import { ARTICLE_TYPES, JOURNAL_OPTIONS as JOURNAL_TYPES } from "@/data/journalOptions";
import { resolveBackendUrl } from "@/lib/api";

const getFullUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  const backend = resolveBackendUrl();
  if (url.startsWith("/media")) return `${backend}${url}`;
  const path = url.startsWith("/") ? url : `/${url}`;
  return `${backend}/media${path}`;
};

const inferArticleType = (article) => {
  const title = article.title?.toLowerCase() || "";
  if (title.includes("review")) return "Review Article";
  if (title.includes("case")) return "Case Study";
  if (title.includes("report")) return "Technical Report";
  if (title.includes("communication")) return "Short Communication";
  return "Research Paper";
};

const sortByDateDesc = (articles) =>
  [...articles].sort((a, b) => new Date(b.publishedDate || 0) - new Date(a.publishedDate || 0));

const DownloadList = ({ articles, onDownload, emptyMessage }) => {
  if (!articles.length) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-background p-8 text-center text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {articles.map((article) => (
        <div
          key={article.id}
          className="flex flex-col gap-4 rounded-xl border border-border bg-background p-5 md:flex-row md:items-center md:justify-between"
        >
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
                {article.articleType}
              </span>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                {article.category}
              </span>
              <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                {article.readTime}
              </span>
              <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-foreground">
                {article.downloads || 0} download{article.downloads === 1 ? "" : "s"}
              </span>
            </div>
            <h3 className="font-serif text-xl font-semibold text-heading">{article.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              By {article.author} {article.publishedDate ? `- ${article.publishedDate}` : ""}
            </p>
          </div>

          <Button variant="outline" onClick={() => onDownload(article)} className="md:shrink-0">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
        </div>
      ))}
    </div>
  );
};

const Articles = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const { journals, editors, currentUser, logoutUser, recordArticleDownload } = useAppData();
  const [activeTab, setActiveTab] = useState("about");
  const [selectedArticleType, setSelectedArticleType] = useState("all");

  const journalIdFromUrl = searchParams.get("journal") || "";

  const normalizedArticles = useMemo(
    () =>
      journals.map((article) => ({
        ...article,
        articleType: article.articleType || inferArticleType(article),
      })),
    [journals],
  );

  const selectedJournal = useMemo(
    () => JOURNAL_TYPES.find((journal) => journal.id === journalIdFromUrl) || null,
    [journalIdFromUrl],
  );

  const filteredEditors = useMemo(() => {
    if (!selectedJournal) return editors;
    return editors.filter(
      (editor) => editor.mappedJournalCategory === selectedJournal.category,
    );
  }, [editors, selectedJournal]);

  const journalArticles = useMemo(() => {
    if (!selectedJournal) return [];

    const filtered = normalizedArticles.filter((article) => article.journalName === selectedJournal.title);
    if (selectedArticleType === "all") return sortByDateDesc(filtered);
    return sortByDateDesc(filtered.filter((article) => article.articleType === selectedArticleType));
  }, [normalizedArticles, selectedJournal, selectedArticleType]);

  const articlesInPress = journalArticles.slice(0, 3);
  const archive = journalArticles;
  const journalDownloadCount = useMemo(
    () => journalArticles.reduce((total, article) => total + (article.downloads || 0), 0),
    [journalArticles],
  );

  useEffect(() => {
    const categoryFromUrl = searchParams.get("category");
    if (!journalIdFromUrl && categoryFromUrl) {
      const matchedJournal = JOURNAL_TYPES.find((journal) => journal.category === categoryFromUrl);
      if (matchedJournal) {
        setSearchParams({ journal: matchedJournal.id });
      }
    }
  }, [journalIdFromUrl, searchParams, setSearchParams]);

  const handleDownload = async (article) => {
    await recordArticleDownload(article.id);
    const fileUrl = getFullUrl(article.file);
    if (fileUrl) {
      window.open(fileUrl, "_blank", "noopener,noreferrer");
    }
    toast({
      title: "Download Started",
      description: `Downloading ${article.title}.pdf`,
    });
  };

  const handleSubmit = () => {
    if (!selectedJournal) return;

    const params = new URLSearchParams();
    params.set("journalType", selectedJournal.category);
    params.set("journalName", selectedJournal.title);
    if (selectedArticleType !== "all") {
      params.set("articleType", selectedArticleType);
    }

    const target = "/publish";
    navigate(`${target}?${params.toString()}`);
  };

  const renderTabContent = () => {
    if (!selectedJournal) return null;

    if (activeTab === "about") {
      return (
        <div className="rounded-r-xl border border-l-0 border-border bg-card p-8 leading-8 text-muted-foreground">
          <p>{selectedJournal.about}</p>
          <p className="mt-6">
            This journal is designed to support high-impact scholarly communication, strong editorial oversight,
            and accessible publication pathways for authors working in {selectedJournal.category.toLowerCase()}.
          </p>
          <div className="mt-8">
            <h3 className="font-serif text-2xl font-semibold text-heading">Journal Highlights</h3>
            <ul className="mt-4 space-y-3 text-foreground">
              <li>Peer-reviewed and scope-focused editorial evaluation</li>
              <li>Downloadable article archive and current issue access</li>
              <li>Direct submission path for authors in this journal type</li>
            </ul>
          </div>
        </div>
      );
    }

    if (activeTab === "editorial-board") {
      return (
        <div className="rounded-r-xl border border-l-0 border-border bg-card p-8">
          <div className="mb-6 flex items-center gap-2 text-primary">
            <Users className="h-5 w-5" />
            <span className="text-sm font-medium uppercase tracking-wide">Editorial Board</span>
          </div>
          {filteredEditors.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredEditors.map((editor) => (
                <div key={editor.id} className="rounded-xl border border-border bg-background p-5">
                  <h3 className="font-serif text-xl font-semibold text-heading">{editor.name}</h3>
                  <p className="mt-1 text-sm text-primary">{editor.penName || "Editorial Board Member"}</p>
                  <p className="mt-3 text-sm text-muted-foreground">{editor.email || "No email available"}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{editor.country || "Country not provided"}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-background p-8 text-center text-muted-foreground">
              No editors are mapped to this journal category yet.
            </div>
          )}
        </div>
      );
    }

    if (activeTab === "articles-in-press") {
      return (
        <div className="rounded-r-xl border border-l-0 border-border bg-card p-8">
          <DownloadList
            articles={articlesInPress}
            onDownload={handleDownload}
            emptyMessage="No article in press data available for this journal."
          />
        </div>
      );
    }

    return (
      <div className="rounded-r-xl border border-l-0 border-border bg-card p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <div className="mb-3 flex items-center gap-2 text-primary">
              <FileCheck className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-wide">Submit Manuscript</span>
            </div>
            <h3 className="font-serif text-2xl font-semibold text-heading">{selectedJournal.title}</h3>
            <p className="mt-3 text-muted-foreground">
              Select the article type and continue to the submission form for this journal category.
            </p>
            <div className="mt-5 max-w-sm">
              <Select value={selectedArticleType} onValueChange={setSelectedArticleType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select article type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Choose on form</SelectItem>
                  {ARTICLE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button size="lg" onClick={handleSubmit}>
            <Send className="mr-2 h-4 w-4" />
            Continue To Submit
          </Button>
        </div>
      </div>
    );
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
        submitPath="/publish"
      />

      <main>
        <section className="bg-[linear-gradient(135deg,#243342,#2d3d49)] py-10 text-white">
          <div className="container">
            <div className="text-sm">
              <Link to="/" className="hover:text-white/80">
                Home
              </Link>
              <span className="mx-3">&gt;</span>
              {selectedJournal ? (
                <span>{selectedJournal.title}</span>
              ) : (
                <span>Journals</span>
              )}
            </div>
          </div>
        </section>

        <section className="py-12 md:py-16">
          <div className="container">
            {!selectedJournal ? (
              <>
                <div className="mb-12 text-center">
                  <h1 className="font-serif text-4xl font-bold text-heading md:text-5xl">QuiLive Publishers</h1>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {JOURNAL_TYPES.map((journal) => (
                    <button
                      key={journal.id}
                      type="button"
                      onClick={() => {
                        setActiveTab("about");
                        setSearchParams({ journal: journal.id });
                      }}
                      className="text-left transition-smooth hover:-translate-y-1"
                    >
                      <div className="overflow-hidden rounded-sm">
                        <img
                          src={journal.image}
                          alt={journal.title}
                          className="h-[190px] w-full object-cover"
                        />
                      </div>
                      <h2 className="px-3 py-3 text-center font-serif text-lg font-semibold text-heading">
                        {journal.title}
                      </h2>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="mb-8 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab("about");
                      setSelectedArticleType("all");
                      setSearchParams({});
                    }}
                    className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-smooth"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Journals
                  </button>
                </div>

                <div className="mb-8 rounded-xl overflow-hidden">
                  <img
                    src={selectedJournal.image}
                    alt={selectedJournal.title}
                    className="h-[220px] w-full object-cover"
                  />
                </div>

                <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h1 className="font-serif text-3xl font-bold text-heading md:text-4xl">{selectedJournal.title}</h1>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {selectedJournal.category}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <FolderArchive className="h-4 w-4" />
                        {archive.length} article{archive.length === 1 ? "" : "s"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <DownloadCloud className="h-4 w-4" />
                        {journalDownloadCount} total download{journalDownloadCount === 1 ? "" : "s"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <FileClock className="h-4 w-4" />
                        Quarterly Publication Flow
                      </span>
                    </div>
                  </div>

                  <div className="w-full max-w-xs">
                    <Select value={selectedArticleType} onValueChange={setSelectedArticleType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter article type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Article Types</SelectItem>
                        {ARTICLE_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[280px_1fr] lg:items-start">
                  <div className="rounded-2xl border border-border bg-card p-3 shadow-soft">
                    {[
                      ["about", "About Journal"],
                      ["editorial-board", "Editorial Board"],
                      ["articles-in-press", "Article in Press"],
                      ["submit-manuscript", "Submit Manuscript"],
                    ].map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setActiveTab(value)}
                        className={`mb-2 flex w-full items-center rounded-xl border px-5 py-4 text-left text-base transition-smooth last:mb-0 ${
                          activeTab === value
                            ? "border-primary bg-primary text-primary-foreground shadow-soft"
                            : "border-border bg-background text-foreground hover:border-primary/40 hover:bg-secondary"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>

                  {renderTabContent()}
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Articles;
