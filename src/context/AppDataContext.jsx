import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { extractApiError } from "@/lib/api";

const AppDataContext = createContext(null);

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";

const mapStatusFromApi = (status) => {
  const statusMap = {
    PENDING: "Pending",
    UNDER_REVIEW: "Under Review",
    COMPLETED: "Completed",
    PUBLISHED: "Published",
    REJECTED: "Rejected",
  };
  return statusMap[status] || status;
};

export const AppDataProvider = ({ children }) => {
  const [editors, setEditors] = useState([]);
  const [journals, setJournals] = useState([]);
  const [trendingArticles, setTrendingArticles] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [settings, setSettings] = useState({
    socials: {},
    about: {},
    contact: {},
    carouselImages: [],
    submissionNotifications: {
      commonEmail: "",
      journalEmails: {},
    },
  });
  const [users, setUsers] = useState([]); // Kept for stats if needed, or remove if API doesn't provide
  const [currentUser, setCurrentUser] = useState(null);
  const [currentEditor, setCurrentEditor] = useState(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);

  // Helper for authenticated fetch
  const authFetch = useCallback(async (endpoint, options = {}) => {
    const csrfToken = localStorage.getItem("csrfToken");
    const headers = {
      "X-CSRFToken": csrfToken || "",
      ...options.headers,
    };

    // Don't set Content-Type for FormData (browser sets it with boundary)
    if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: "include",
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(extractApiError(error, "API request failed"));
    }
    return response.json();
  }, []);

  // --- Data Fetching ---

  const fetchJournals = useCallback(async () => {
    try {
      const data = await authFetch("/api/journals/");
      // Map API response to frontend structure if needed
      const mappedJournals = data.map(j => ({
        id: j.id,
        title: j.title,
        author: j.author_name,
        category: j.category,
        journalName: j.journal_name,
        publishedDate: j.published_date,
        image: j.image,
        excerpt: j.excerpt || "",
        file: j.file,
        downloads: j.downloads || 0,
        readTime: j.read_time ? `${j.read_time} min read` : "5 min read"
      }));
      setJournals(mappedJournals);
    } catch (error) {
      console.error("Failed to fetch journals:", error);
    }
  }, [authFetch]);

  const fetchTrendingArticles = useCallback(async () => {
    try {
      const data = await authFetch("/api/articles/trending/");
      const mappedTrending = data.map(j => ({
        id: j.id,
        title: j.title,
        author: j.author_name,
        category: j.category,
        journalName: j.journal_name,
        publishedDate: j.published_date,
        image: j.image,
        excerpt: j.excerpt || "",
        file: j.file,
        downloads: j.downloads || 0,
        readTime: j.read_time ? `${j.read_time} min read` : "5 min read"
      }));
      setTrendingArticles(mappedTrending);
    } catch (error) {
      console.error("Failed to fetch trending articles:", error);
    }
  }, [authFetch]);

  const fetchSettings = useCallback(async () => {
    try {
      const data = await authFetch("/api/settings/");
      // Map backend (snake_case) to frontend (camelCase)
      setSettings({
        socials: data.social_links || {},
        about: data.about_section || { description: data.about_text || "" },
        contact: data.contact_info || {},
        carouselImages: data.carousel_images || [],
        submissionNotifications: {
          commonEmail: data.submission_notifications?.common_email || "",
          journalEmails: data.submission_notifications?.journal_emails || {},
        },
      });
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    }
  }, [authFetch]);

  const fetchEditors = useCallback(async () => {
    try {
      const data = await authFetch("/api/editors/");
      setEditors(data.map(e => ({
        id: e.id,
        name: e.full_name,
        email: e.email,
        penName: e.pen_name,
        country: e.country,
        mappedJournalCategory: e.mapped_journal_category || "",
      })));
    } catch (error) {
      console.error("Failed to fetch editors:", error);
    }
  }, [authFetch]);

  const fetchUsers = useCallback(async () => {
    if (!isAdminLoggedIn) return;
    try {
      const data = await authFetch("/api/users/");
      setUsers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      // Silently fail if endpoint doesn't exist or fails
    }
  }, [authFetch, isAdminLoggedIn]);

  const fetchSubmissions = useCallback(async () => {
    let endpoint = "";
    if (isAdminLoggedIn) endpoint = "/api/submissions/all/";
    else if (currentEditor) endpoint = "/api/editor/tasks/";
    else if (currentUser) endpoint = "/api/submissions/my/";
    else return;

    try {
      const data = await authFetch(endpoint);
      const mappedSubmissions = data.map(s => ({
        id: s.id,
        fullName: s.author_name || s.full_name, // Handle variations
        email: s.author_email || s.email,
        country: s.country,
        whatsapp: s.whatsapp,
        articleType: s.article_type,
        journalType: s.category || s.journal_type,
        journalName: s.journal_name || "",
        fileName: s.file ? s.file.split('/').pop() : "", // Extract filename
        fileUrl: s.file,
        image: s.image,
        status: mapStatusFromApi(s.status),
        assignedTo: s.assigned_to,
        editorReport: s.editor_report || "",
        submittedDate: s.created_at?.split('T')[0] || s.submitted_date,
      }));
      setSubmissions(mappedSubmissions);
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
    }
  }, [authFetch, isAdminLoggedIn, currentEditor, currentUser]);

  // --- Auth Check (Session Restoration) ---
  const checkAuth = useCallback(async () => {
    try {
      // This uses the cookie to ask backend "Who am I?"
      const data = await authFetch("/api/user/me/");
      
      if (data.role === "ADMIN") {
        setIsAdminLoggedIn(true);
        setCurrentEditor(null);
        setCurrentUser(null);
        setAdminUser({ name: data.full_name, email: data.email, role: data.role });
      } else if (data.role === "EDITOR") {
        setIsAdminLoggedIn(false);
        setAdminUser(null);
        setCurrentUser(null);
        setCurrentEditor({
          id: data.id,
          name: data.full_name,
          email: data.email,
          role: data.role,
          mappedJournalCategory: data.mapped_journal_category || "",
        });
      } else {
        setIsAdminLoggedIn(false);
        setAdminUser(null);
        setCurrentEditor(null);
        setCurrentUser({ id: data.id, username: data.full_name, email: data.email, role: data.role });
      }
    } catch (error) {
      // Not logged in or session expired - that's okay, user stays logged out
    } finally {
      setIsAuthChecking(false);
    }
  }, [authFetch]);

  // Initial Load (Public Data)
  useEffect(() => {
    fetchJournals();
    fetchTrendingArticles();
    fetchSettings();
    fetchEditors();
    checkAuth();
  }, [fetchJournals, fetchTrendingArticles, fetchSettings, fetchEditors, checkAuth]);

  // Role-based Data Load
  useEffect(() => {
    if (isAdminLoggedIn) {
      fetchEditors();
      fetchUsers();
      fetchSubmissions();
    } else if (currentEditor || currentUser) {
      fetchSubmissions();
    } else {
      setSubmissions([]); // Clear sensitive data on logout
    }
  }, [isAdminLoggedIn, currentEditor, currentUser, fetchEditors, fetchSubmissions, fetchUsers]);

  // Submission functions
  const addSubmission = async (formData) => {
    // formData should be a FormData object containing file, image, and text fields
    try {
      await authFetch("/api/submissions/", {
        method: "POST",
        body: formData,
      });
      fetchSubmissions(); // Refresh list
    } catch (error) {
      console.error("Error adding submission:", error);
      throw error;
    }
  };

  const assignSubmission = async (submissionId, editorId) => {
    try {
      await authFetch(`/api/submissions/${submissionId}/assign/`, {
        method: "PATCH",
        body: JSON.stringify({ editor_id: editorId }),
      });
      fetchSubmissions();
    } catch (error) {
      console.error("Error assigning submission:", error);
      throw error;
    }
  };

  const updateSubmissionStatus = async (submissionId, status, extraData = {}) => {
    try {
      await authFetch(`/api/submissions/${submissionId}/status/`, {
        method: "PATCH",
        body: JSON.stringify({ status, ...extraData }),
      });
      fetchSubmissions();
      // If published, refresh journals too
      if (status === "PUBLISHED") {
        fetchJournals();
      }
    } catch (error) {
      console.error("Error updating status:", error);
      throw error;
    }
  };

  // If status is "Published", add to journals
  const publishSubmission = async (submissionId) => {
    // Backend handles creation of journal entry on status change
    await updateSubmissionStatus(submissionId, "PUBLISHED");
  };

  // Analytics functions
  const recordArticleView = async (articleId) => {
    try {
      await authFetch(`/api/articles/${articleId}/view/`, { method: "POST" });
      fetchTrendingArticles();
    } catch (error) {
      console.error("Error recording view:", error);
    }
  };

  const recordArticleDownload = async (articleId) => {
    try {
      await authFetch(`/api/articles/${articleId}/download/`, { method: "POST" });
      fetchJournals();
      fetchTrendingArticles();
    } catch (error) {
      console.error("Error recording download:", error);
    }
  };

  // Settings functions
  const updateSettings = async (newSettings) => {
    try {
      // Map frontend (camelCase) to backend (snake_case)
      const apiBody = {
        carousel_images: newSettings.carouselImages || [],
        social_links: newSettings.socials || {},
        contact_info: newSettings.contact || {},
        about_section: newSettings.about || {},
        submission_notifications: {
          common_email: newSettings.submissionNotifications?.commonEmail || "",
          journal_emails: newSettings.submissionNotifications?.journalEmails || {},
        },
      };
      await authFetch("/api/settings/", {
        method: "PUT", // or PATCH
        body: JSON.stringify(apiBody),
      });
      setSettings(newSettings);
    } catch (error) {
      console.error("Error updating settings:", error);
      throw error;
    }
  };

  const addCarouselImage = (imageUrl) => {
    // Optimistic update, then sync with backend
    const updatedImages = [...(settings.carouselImages || []), imageUrl];
    const updatedSettings = { ...settings, carouselImages: updatedImages };
    updateSettings(updatedSettings);
  };

  const removeCarouselImage = (index) => {
    const updatedImages = settings.carouselImages.filter((_, i) => i !== index);
    const updatedSettings = { ...settings, carouselImages: updatedImages };
    updateSettings(updatedSettings);
  };

  // Auth functions
  const loginAdmin = (userData) => {
    setIsAdminLoggedIn(true);
    setAdminUser(userData);
    setCurrentEditor(null);
    setCurrentUser(null);
    return true;
  };

  const promoteUserToEditor = async (userId) => {
    try {
      await authFetch(`/api/users/${userId}/promote-editor/`, {
        method: "PATCH",
        body: JSON.stringify({}),
      });
      await Promise.all([fetchUsers(), fetchEditors()]);
    } catch (error) {
      console.error("Error promoting user to editor:", error);
      throw error;
    }
  };

  const updateEditorJournalCategory = async (editorId, mappedJournalCategory) => {
    try {
      await authFetch(`/api/editors/${editorId}/category/`, {
        method: "PATCH",
        body: JSON.stringify({
          mapped_journal_category: mappedJournalCategory || null,
        }),
      });
      await Promise.all([fetchEditors(), fetchSubmissions()]);
    } catch (error) {
      console.error("Error updating editor journal category:", error);
      throw error;
    }
  };

  const logoutAdmin = async () => {
    setIsAdminLoggedIn(false);
    setAdminUser(null);
    setCurrentEditor(null);
    setCurrentUser(null);
    try {
      const backendUrl = BACKEND_URL;
      const csrfToken = localStorage.getItem("csrfToken");
      await fetch(`${backendUrl}/api/logout/`, {
        method: "POST",
        headers: {
          "X-CSRFToken": csrfToken || "",
        },
        credentials: "include",
      });
      localStorage.removeItem("csrfToken");
    } catch (error) {
      console.error("Admin logout failed:", error);
    }
  };

  const loginEditor = (userData) => {
    setIsAdminLoggedIn(false);
    setAdminUser(null);
    setCurrentEditor(userData);
    setCurrentUser(null);
    return true;
  };

  const logoutEditor = async () => {
    setCurrentEditor(null);
    setIsAdminLoggedIn(false);
    setAdminUser(null);
    try {
      const backendUrl = BACKEND_URL;
      const csrfToken = localStorage.getItem("csrfToken");
      await fetch(`${backendUrl}/api/logout/`, {
        method: "POST",
        headers: {
          "X-CSRFToken": csrfToken || "",
        },
        credentials: "include",
      });
      localStorage.removeItem("csrfToken");
    } catch (error) {
      console.error("Editor logout failed:", error);
    }
  };

  const loginUser = (user) => {
    setIsAdminLoggedIn(false);
    setAdminUser(null);
    setCurrentEditor(null);
    setCurrentUser(user);
  };

  const logoutUser = async () => {
    setCurrentUser(null);
    setIsAdminLoggedIn(false);
    setAdminUser(null);
    setCurrentEditor(null);
    try {
      const backendUrl = BACKEND_URL;
      const csrfToken = localStorage.getItem("csrfToken");
      await fetch(`${backendUrl}/api/logout/`, {
        method: "POST",
        headers: {
          "X-CSRFToken": csrfToken || "",
        },
        credentials: "include",
      });
      localStorage.removeItem("csrfToken");
    } catch (error) {
      console.error("User logout failed:", error);
    }
  };

  // Stats
  const getStats = () => ({
    totalJournals: journals.length,
    registeredUsers: users.length,
    activeEditors: editors.length,
    pendingReviews: submissions.filter((s) => s.status === "Pending").length,
  });

  const getEditorStats = (editorId) => {
    const editorSubmissions = submissions.filter((s) => s.assignedTo === editorId);
    return {
      totalAssigned: editorSubmissions.length,
      pendingReview: editorSubmissions.filter((s) => s.status === "Under Review").length,
      completed: editorSubmissions.filter((s) => s.status === "Completed" || s.status === "Published").length,
    };
  };

  const value = {
    // Data
    editors,
    journals,
    trendingArticles,
    submissions,
    settings,
    users,
    currentUser,
    currentEditor,
    isAdminLoggedIn,
    adminUser,
    isAuthChecking,
    checkAuth,
    promoteUserToEditor,
    updateEditorJournalCategory,
    // Submission functions
    addSubmission,
    assignSubmission,
    updateSubmissionStatus,
    publishSubmission,
    // Analytics
    recordArticleView,
    recordArticleDownload,
    // Settings functions
    updateSettings,
    addCarouselImage,
    removeCarouselImage,
    // Auth functions
    loginAdmin,
    logoutAdmin,
    loginEditor,
    logoutEditor,
    loginUser,
    logoutUser,
    // Stats
    getStats,
    getEditorStats,
  };

  return (
    <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error("useAppData must be used within an AppDataProvider");
  }
  return context;
};
