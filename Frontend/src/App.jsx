import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import { AppDataProvider } from "@/context/AppDataContext";
import { ThemeProvider } from "@/context/ThemeContext";
import ScrollToTop from "@/components/ScrollToTop";
import StaticContentPage from "./pages/StaticContentPage";
import ContactPage from "./pages/ContactPage";
import Index from "./pages/Index";
import Articles from "./pages/Articles";
import Publish from "./pages/Publish";
import UserDashboard from "./pages/UserDashboard";
import CommonLogin from "./pages/CommonLogin";
import AdminDashboard from "./pages/AdminDashboard";
import EditorDashboard from "./pages/EditorDashboard";
import EditorArticleView from "./pages/EditorArticleView";
import UsersDirectory from "./pages/UsersDirectory";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppDataProvider>
        <ThemeProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <ScrollToTop />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/articles" element={<Articles />} />
              <Route path="/journals" element={<Articles />} />
              <Route path="/about-us" element={<StaticContentPage />} />
              <Route path="/open-access" element={<StaticContentPage />} />
              <Route path="/guidelines" element={<StaticContentPage />} />
              <Route path="/author-guidelines" element={<StaticContentPage />} />
              <Route path="/processing-fee" element={<StaticContentPage />} />
              <Route path="/manuscript-guidelines" element={<StaticContentPage />} />
              <Route path="/peer-review-process" element={<StaticContentPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/submit-and-register" element={<Publish />} />
              <Route path="/publish" element={<Publish />} />
              <Route path="/admin/login" element={<CommonLogin />} />
              <Route path="/editor/login" element={<CommonLogin />} />
              <Route path="/user/dashboard" element={<UserDashboard />} />
              <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/editor" element={<Navigate to="/editor/login" replace />} />
              <Route path="/editor/dashboard" element={<EditorDashboard />} />
              <Route path="/editor/submission/:id" element={<EditorArticleView />} />
              <Route path="/users" element={<UsersDirectory />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </AppDataProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
