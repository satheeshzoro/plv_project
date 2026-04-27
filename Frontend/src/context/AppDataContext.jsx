import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { extractApiError, resolveBackendUrl } from "@/lib/api";

const AppDataContext = createContext(null);

const BACKEND_URL = resolveBackendUrl();

const mapStatusFromApi = (status) => {
  const statusMap = {
    PENDING: "Pending",
    UNDER_REVIEW: "Under Review",
    EDITOR_COMPLETED: "Editor Completed",
    UNDER_REVIEWER_REVIEW: "Under Reviewer Review",
    REVIEWER_COMPLETED: "Reviewer Completed",
    COMPLETED: "Completed",
    PUBLISHED: "Published",
    ARCHIVED: "Archived",
    REJECTED: "Rejected",
  };
  return statusMap[status] || status;
};

const mapArticleToCard = (article) => ({
  id: article.id,
  title: article.title,
  author: article.author_name,
  category: article.category,
  journalName: article.journal_name,
  publishedDate: article.published_date,
  image: article.image,
  excerpt: article.excerpt || "",
  file: article.file,
  downloads: article.downloads || 0,
  readTime: article.read_time ? `${article.read_time} min read` : "5 min read",
});

export const AppDataProvider = ({ children }) => {
  const [editors, setEditors] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [journals, setJournals] = useState([]);
  const [archivedJournals, setArchivedJournals] = useState([]);
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
  const [userDirectory, setUserDirectory] = useState([]);
  const [recentPublished, setRecentPublished] = useState([]);
  const [profileSummary, setProfileSummary] = useState(null);
  const [dashboardAnalytics, setDashboardAnalytics] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentEditor, setCurrentEditor] = useState(null);
  const [currentReviewer, setCurrentReviewer] = useState(null);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const authRequestVersionRef = useRef(0);

  const clearAuthState = useCallback(() => {
    setIsAdminLoggedIn(false);
    setCurrentEditor(null);
    setCurrentReviewer(null);
    setCurrentUser(null);
    setAdminUser(null);
  }, []);

  const applyAuthState = useCallback((data) => {
    const normalizedRole = data?.role?.toUpperCase();

    if (normalizedRole === "ADMIN") {
      setIsAdminLoggedIn(true);
      setCurrentEditor(null);
      setCurrentUser(null);
      setAdminUser({ name: data.full_name, email: data.email, role: data.role });
      return;
    }

    if (normalizedRole === "EDITOR") {
      setIsAdminLoggedIn(false);
      setAdminUser(null);
      setCurrentUser(null);
      setCurrentReviewer(null);
      setCurrentEditor({
        id: data.id,
        name: data.full_name || data.name,
        email: data.email,
        role: data.role,
        profileImage: data.profile_image || null,
        requiresProfileImage:
          data.requires_profile_image ??
          (data.role?.toUpperCase() === "EDITOR" && !data.profile_image),
        mappedJournalCategory: data.mapped_journal_category || data.mappedJournalCategory || "",
      });
      return;
    }

    if (normalizedRole === "REVIEWER") {
      setIsAdminLoggedIn(false);
      setAdminUser(null);
      setCurrentUser(null);
      setCurrentEditor(null);
      setCurrentReviewer({
        id: data.id,
        name: data.full_name || data.name,
        email: data.email,
        role: data.role,
        profileImage: data.profile_image || null,
        requiresProfileImage:
          data.requires_profile_image ??
          (data.role?.toUpperCase() === "REVIEWER" && !data.profile_image),
        mappedJournalCategory: data.mapped_journal_category || data.mappedJournalCategory || "",
      });
      return;
    }

    setIsAdminLoggedIn(false);
    setAdminUser(null);
    setCurrentEditor(null);
    setCurrentReviewer(null);
    setCurrentUser({
      id: data.id,
      username: data.full_name || data.username || data.name,
      email: data.email,
      role: data.role,
    });
  }, []);

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
      const detail = typeof error?.detail === "string" ? error.detail.toLowerCase() : "";
      const isAuthMissing =
        detail.includes("authentication credentials were not provided") ||
        detail.includes("not authenticated") ||
        detail.includes("session") ||
        detail.includes("credentials");

      if (response.status === 401 || (response.status === 403 && isAuthMissing)) {
        clearAuthState();
        throw new Error("Your session has expired or is not available on this host. Please sign in again.");
      }

      throw new Error(extractApiError(error, "API request failed"));
    }
    return response.json();
  }, [clearAuthState]);

  // --- Data Fetching ---
  const fetchJournals = useCallback(async () => {
    try {
      const data = await authFetch("/api/journals/");
      const mappedJournals = data.map(mapArticleToCard);
      setJournals(mappedJournals);
    } catch (error) {
      console.error("Failed to fetch journals:", error);
    }
  }, [authFetch]);

  const fetchArchivedJournals = useCallback(async () => {
    if (!isAdminLoggedIn) {
      setArchivedJournals([]);
      return;
    }

    try {
      const data = await authFetch("/api/admin/journals/archived/");
      setArchivedJournals(data.map(mapArticleToCard));
    } catch (error) {
      console.error("Failed to fetch archived journals:", error);
      setArchivedJournals([]);
    }
  }, [authFetch, isAdminLoggedIn]);

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
        profileImage: e.profile_image || null,
        requiresProfileImage: Boolean(e.requires_profile_image),
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

  const fetchUserDirectory = useCallback(async () => {
    try {
      const data = await authFetch("/api/users/directory/");
      setUserDirectory(data);
    } catch (error) {
      console.error("Failed to fetch user directory:", error);
      setUserDirectory([]);
    }
  }, [authFetch]);

  const fetchReviewers = useCallback(async () => {
    try {
      const data = await authFetch("/api/reviewers/");
      setReviewers(data.map(e => ({
        id: e.id,
        name: e.full_name,
        email: e.email,
        role: e.role,
        penName: e.pen_name,
        country: e.country,
        profileImage: e.profile_image || null,
        requiresProfileImage: Boolean(e.requires_profile_image),
        mappedJournalCategory: e.mapped_journal_category || "",
      })));
    } catch (error) {
      console.error("Failed to fetch reviewers:", error);
    }
  }, [authFetch]);

  const fetchRecentPublished = useCallback(async () => {
    try {
      const data = await authFetch("/api/recent-published/?limit=20");
      setRecentPublished(data);
    } catch (error) {
      console.error("Failed to fetch recent published:", error);
      setRecentPublished([]);
    }
  }, [authFetch]);

  const fetchProfileSummary = useCallback(async () => {
    try {
      const data = await authFetch("/api/profile/");
      setProfileSummary(data);
      return data;
    } catch (error) {
      console.error("Failed to fetch profile summary:", error);
      setProfileSummary(null);
      return null;
    }
  }, [authFetch]);

  const updateProfileSummary = useCallback(async (payload) => {
    const data = await authFetch("/api/profile/", {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
    setProfileSummary(data);

    if (data.role === "USER") {
      setCurrentUser((prev) => prev ? {
        ...prev,
        username: data.full_name,
        email: data.email,
      } : prev);
    } else if (data.role === "EDITOR") {
      setCurrentEditor((prev) => prev ? {
        ...prev,
        name: data.full_name,
        email: data.email,
        profileImage: data.profile_image || prev.profileImage || null,
        requiresProfileImage:
          data.requires_profile_image ??
          (data.role?.toUpperCase() === "EDITOR" && !data.profile_image),
      } : prev);
    } else if (data.role === "REVIEWER") {
      setCurrentReviewer((prev) => prev ? {
        ...prev,
        name: data.full_name,
        email: data.email,
        profileImage: data.profile_image || prev.profileImage || null,
        requiresProfileImage:
          data.requires_profile_image ??
          (data.role?.toUpperCase() === "REVIEWER" && !data.profile_image),
      } : prev);
    } else if (data.role === "ADMIN") {
      setAdminUser((prev) => prev ? {
        ...prev,
        name: data.full_name,
        email: data.email,
      } : prev);
    }

    return data;
  }, [authFetch]);

  const fetchDashboardAnalytics = useCallback(async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.year) params.set("year", String(filters.year));
    if (filters.month) params.set("month", String(filters.month));
    const query = params.toString();
    const endpoint = query ? `/api/analytics/dashboard/?${query}` : "/api/analytics/dashboard/";

    const data = await authFetch(endpoint);
    setDashboardAnalytics(data);
    return data;
  }, [authFetch]);

  const fetchSubmissions = useCallback(async () => {
    let endpoint = "";
    if (isAdminLoggedIn) endpoint = "/api/submissions/all/";
    else if (currentEditor) endpoint = "/api/editor/tasks/";
    else if (currentReviewer) endpoint = "/api/reviewer/tasks/";
    else if (currentUser) endpoint = "/api/submissions/history/";
    else return;

    try {
      const data = await authFetch(endpoint);
      const mappedSubmissions = data.map(s => ({
        id: Number(s.id),
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
        assignedTo: s.assigned_to != null ? Number(s.assigned_to) : null,
        reviewerAssignedTo: s.reviewer_assigned_to != null ? Number(s.reviewer_assigned_to) : null,
        editorReport: s.editor_report || "",
        reviewerReport: s.reviewer_report || "",
        reviewerForm: s.reviewer_form || {},
        reviewerSubmittedAt: s.reviewer_submitted_at || null,
        submittedDate: s.created_at?.split('T')[0] || s.submitted_date,
      }));
      setSubmissions(mappedSubmissions);
    } catch (error) {
      console.error("Failed to fetch submissions:", error);
    }
  }, [authFetch, isAdminLoggedIn, currentEditor, currentReviewer, currentUser]);

  // --- Auth Check (Session Restoration) ---
  const checkAuth = useCallback(async () => {
    const requestVersion = ++authRequestVersionRef.current;

    try {
      // This uses the cookie to ask backend "Who am I?"
      const data = await authFetch("/api/user/me/");

      if (requestVersion === authRequestVersionRef.current) {
        applyAuthState(data);
      }
    } catch (error) {
      if (requestVersion === authRequestVersionRef.current) {
        clearAuthState();
      }
    } finally {
      if (requestVersion === authRequestVersionRef.current) {
        setIsAuthChecking(false);
      }
    }
  }, [applyAuthState, authFetch, clearAuthState]);

  // Initial Load (Public Data)
  useEffect(() => {
    fetchJournals();
    fetchTrendingArticles();
    fetchSettings();
    fetchEditors();
    fetchReviewers();
    checkAuth();
  }, [fetchJournals, fetchTrendingArticles, fetchSettings, fetchEditors, fetchReviewers, checkAuth]);

  // Role-based Data Load
  useEffect(() => {
    if (isAdminLoggedIn) {
      fetchEditors();
      fetchReviewers();
      fetchUsers();
      fetchUserDirectory();
      fetchArchivedJournals();
      fetchSubmissions();
      fetchRecentPublished();
      fetchProfileSummary();
      fetchDashboardAnalytics().catch((error) => {
        console.error("Failed to fetch dashboard analytics:", error);
        setDashboardAnalytics(null);
      });
    } else if (currentEditor || currentReviewer || currentUser) {
      fetchSubmissions();
      fetchUserDirectory();
      fetchRecentPublished();
      fetchProfileSummary();
      if (currentEditor) {
        fetchReviewers();
      }
      if (currentEditor || currentReviewer) {
        fetchDashboardAnalytics().catch((error) => {
          console.error("Failed to fetch dashboard analytics:", error);
          setDashboardAnalytics(null);
        });
      } else {
        setDashboardAnalytics(null);
      }
    } else {
      setSubmissions([]); // Clear sensitive data on logout
      setUserDirectory([]);
      setRecentPublished([]);
      setArchivedJournals([]);
      setReviewers([]);
      setProfileSummary(null);
      setDashboardAnalytics(null);
    }
  }, [isAdminLoggedIn, currentEditor, currentReviewer, currentUser, fetchArchivedJournals, fetchDashboardAnalytics, fetchEditors, fetchReviewers, fetchProfileSummary, fetchRecentPublished, fetchSubmissions, fetchUserDirectory, fetchUsers]);

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
      const normalizedEditorId = editorId === null || editorId === undefined || editorId === ""
        ? null
        : Number(editorId);
      await authFetch(`/api/submissions/${submissionId}/assign/`, {
        method: "PATCH",
        body: JSON.stringify({ editor_id: normalizedEditorId }),
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
      fetchRecentPublished();
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

  const assignReviewer = async (submissionId, reviewerId) => {
    try {
      const normalizedReviewerId = reviewerId === null || reviewerId === undefined || reviewerId === ""
        ? null
        : Number(reviewerId);
      await authFetch(`/api/submissions/${submissionId}/assign-reviewer/`, {
        method: "PATCH",
        body: JSON.stringify({ reviewer_id: normalizedReviewerId }),
      });
      fetchSubmissions();
    } catch (error) {
      console.error("Error assigning reviewer:", error);
      throw error;
    }
  };

  const submitReviewerReport = async (submissionId, reviewPayload) => {
    try {
      const result = await authFetch(`/api/submissions/${submissionId}/reviewer-report/`, {
        method: "POST",
        body: JSON.stringify(reviewPayload),
      });
      fetchSubmissions();
      return result;
    } catch (error) {
      console.error("Error submitting reviewer report:", error);
      throw error;
    }
  };

  const adminPublishArticle = async (formData) => {
    const result = await authFetch("/api/admin/journals/publish/", {
      method: "POST",
      body: formData,
    });
    await Promise.all([fetchJournals(), fetchSubmissions(), fetchRecentPublished()]);
    return result;
  };

  const archiveJournal = async (journalId) => {
    await authFetch(`/api/admin/journals/${journalId}/`, {
      method: "PATCH",
      body: JSON.stringify({ action: "archive" }),
    });
    await Promise.all([fetchJournals(), fetchArchivedJournals(), fetchSubmissions(), fetchRecentPublished()]);
  };

  const unarchiveJournal = async (journalId) => {
    await authFetch(`/api/admin/journals/${journalId}/`, {
      method: "PATCH",
      body: JSON.stringify({ action: "unarchive" }),
    });
    await Promise.all([fetchJournals(), fetchArchivedJournals(), fetchSubmissions(), fetchRecentPublished()]);
  };

  const deleteJournal = async (journalId) => {
    await authFetch(`/api/admin/journals/${journalId}/`, {
      method: "DELETE",
    });
    await Promise.all([fetchJournals(), fetchArchivedJournals(), fetchSubmissions(), fetchRecentPublished()]);
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
    authRequestVersionRef.current += 1;
    setIsAuthChecking(false);
    applyAuthState({
      email: userData.email,
      full_name: userData.name || userData.full_name,
      role: userData.role,
    });
    return true;
  };

  const changeUserRole = async (userId, role) => {
    try {
      await authFetch(`/api/users/${userId}/role/`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      });
      await Promise.all([fetchUsers(), fetchEditors(), fetchReviewers(), fetchSubmissions()]);
    } catch (error) {
      console.error("Error changing user role:", error);
      throw error;
    }
  };

  const promoteUserToEditor = async (userId) => changeUserRole(userId, "EDITOR");

  const updateEditorJournalCategory = async (editorId, mappedJournalCategory) => {
    try {
      await authFetch(`/api/editors/${editorId}/category/`, {
        method: "PATCH",
        body: JSON.stringify({
          mapped_journal_category: mappedJournalCategory || null,
        }),
      });
      await Promise.all([fetchEditors(), fetchReviewers(), fetchSubmissions()]);
    } catch (error) {
      console.error("Error updating editor journal category:", error);
      throw error;
    }
  };

  const fetchReviewerReport = async (articleId) => {
    return authFetch(`/api/journals/${articleId}/reviewer-report/`);
  };

  const uploadEditorProfileImage = useCallback(async (file) => {
    const formData = new FormData();
    formData.append("profile_image", file);

    const data = await authFetch("/api/editors/me/profile-image/", {
      method: "PUT",
      body: formData,
    });

    setCurrentEditor((prev) => prev ? {
      ...prev,
      profileImage: data.profile_image || null,
      requiresProfileImage: Boolean(data.requires_profile_image),
    } : prev);

    setProfileSummary((prev) => prev ? {
      ...prev,
      profile_image: data.profile_image || null,
      requires_profile_image: Boolean(data.requires_profile_image),
    } : prev);

    await fetchEditors();
    return data;
  }, [authFetch, fetchEditors]);

  const logoutAdmin = async () => {
    authRequestVersionRef.current += 1;
    setIsAuthChecking(false);
    clearAuthState();
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
    authRequestVersionRef.current += 1;
    setIsAuthChecking(false);
    applyAuthState({
      id: userData.id,
      email: userData.email,
      full_name: userData.full_name || userData.name,
      role: userData.role,
      profile_image: userData.profile_image || null,
      requires_profile_image:
        userData.requires_profile_image ??
        (["EDITOR", "REVIEWER"].includes(userData.role?.toUpperCase()) && !userData.profile_image),
      mapped_journal_category: userData.mapped_journal_category || userData.mappedJournalCategory || "",
    });
    return true;
  };

  const logoutEditor = async () => {
    authRequestVersionRef.current += 1;
    setIsAuthChecking(false);
    clearAuthState();
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

  const logoutReviewer = async () => logoutEditor();

  const loginUser = (user) => {
    authRequestVersionRef.current += 1;
    setIsAuthChecking(false);
    applyAuthState({
      id: user.id,
      email: user.email,
      full_name: user.full_name || user.username || user.name,
      role: user.role,
    });
  };

  const logoutUser = async () => {
    authRequestVersionRef.current += 1;
    setIsAuthChecking(false);
    clearAuthState();
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
    activeReviewers: reviewers.length,
    pendingReviews: submissions.filter((s) => ["Pending", "Under Review", "Under Reviewer Review"].includes(s.status)).length,
  });

  const getEditorStats = (editorId) => {
    const editorSubmissions = submissions.filter((s) => Number(s.assignedTo) === Number(editorId));
    return {
      totalAssigned: editorSubmissions.length,
      pendingReview: editorSubmissions.filter((s) =>
        ["Under Review", "Editor Completed", "Under Reviewer Review", "Reviewer Completed"].includes(s.status)
      ).length,
      completed: editorSubmissions.filter((s) => s.status === "Completed" || s.status === "Published").length,
    };
  };

  const value = {
    // Data
    editors,
    reviewers,
    journals,
    archivedJournals,
    trendingArticles,
    submissions,
    settings,
    users,
    userDirectory,
    recentPublished,
    profileSummary,
    dashboardAnalytics,
    currentUser,
    currentEditor,
    currentReviewer,
    isAdminLoggedIn,
    adminUser,
    isAuthChecking,
    checkAuth,
    fetchDashboardAnalytics,
    fetchProfileSummary,
    updateProfileSummary,
    fetchUserDirectory,
    fetchRecentPublished,
    fetchSubmissions,
    promoteUserToEditor,
    changeUserRole,
    updateEditorJournalCategory,
    uploadEditorProfileImage,
    fetchReviewerReport,
    // Submission functions
    addSubmission,
    assignSubmission,
    assignReviewer,
    submitReviewerReport,
    updateSubmissionStatus,
    publishSubmission,
    adminPublishArticle,
    archiveJournal,
    unarchiveJournal,
    deleteJournal,
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
    logoutReviewer,
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
