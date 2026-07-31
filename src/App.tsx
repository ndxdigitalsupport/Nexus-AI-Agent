import { useState, lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route, Outlet, Navigate, useLocation } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import ArtifactStudio from "@/components/ArtifactStudio";
import LoginModal from "@/components/LoginModal";
import { useStore } from "@/store";

// Pages are lazy-loaded so the main bundle stays small and each route loads
// on demand instead of on first paint.
const Home = lazy(() => import("@/pages/Home"));
const Settings = lazy(() => import("@/pages/Settings"));
const History = lazy(() => import("@/pages/History"));
const Agents = lazy(() => import("@/pages/Agents"));
const KnowledgeBase = lazy(() => import("@/pages/KnowledgeBase"));
const AdminDashboard = lazy(() => import("@/pages/AdminDashboard"));
const ActionBoardPage = lazy(() => import("@/pages/ActionBoardPage"));
const ResetPasswordPage = lazy(() => import("@/pages/ResetPassword"));

// Admin-only routes are guarded by the account role resolved from Supabase.
function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { isAdminAuthenticated } = useStore();
  const location = useLocation();

  if (!isAdminAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}

function AppLayout() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  return (
    <div className="flex h-full w-full inset-0 fixed bg-[#070913] overflow-hidden selection:bg-primary selection:text-background font-sans text-text">
      {/* Background Subtle Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Persistent Sidebar */}
      <Sidebar onOpenLoginModal={() => setIsLoginModalOpen(true)} />

      {/* Main Content Area */}
      <main className="flex-1 h-full overflow-hidden flex flex-col relative z-10">
        <Outlet />
      </main>

      {/* Live Artifact & Document Preview Canvas */}
      <ArtifactStudio />

      {/* Pop-up Sign In Modal (Triggers when user clicks Sign In) */}
      <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Suspense fallback={<div className="h-full w-full flex items-center justify-center bg-[#070913] text-cyan-400 font-mono text-sm">Loading...</div>}>
        <Routes>
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/history" element={<History />} />
            <Route path="/action-board" element={<ActionBoardPage />} />
            <Route path="/agents" element={<RequireAdmin><Agents /></RequireAdmin>} />
            <Route path="/knowledge-base" element={<RequireAdmin><KnowledgeBase /></RequireAdmin>} />
            <Route path="/admin" element={<RequireAdmin><AdminDashboard /></RequireAdmin>} />
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}
